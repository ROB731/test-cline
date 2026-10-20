import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

const { prisma } = await import("@/lib/db");
const { issueVerificationCode, verifyCode } = await import("@/lib/verification");
const { hashPassword, verifyPassword, passwordIssues } = await import("@/lib/auth");

beforeEach(async () => {
  await prisma.verificationCode.deleteMany();
  await prisma.rateLimit.deleteMany();
});

describe("mots de passe", () => {
  it("hache et vérifie un mot de passe sans le stocker en clair", () => {
    const hash = hashPassword("motdepasse1");
    expect(hash).not.toContain("motdepasse1");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("motdepasse1", hash)).toBe(true);
    expect(verifyPassword("motdepasse2", hash)).toBe(false);
  });

  it("exige 8 caractères avec lettre et chiffre", () => {
    expect(passwordIssues("court1")).toBeTruthy();
    expect(passwordIssues("sanschiffre")).toBeTruthy();
    expect(passwordIssues("12345678")).toBeTruthy();
    expect(passwordIssues("bonmotdepasse1")).toBeNull();
  });
});

describe("codes de vérification", () => {
  it("accepte le bon code une seule fois", async () => {
    const { devCode } = await issueVerificationCode("0700000009", "SIGNUP");
    expect(devCode).toMatch(/^\d{6}$/);

    const first = await verifyCode("0700000009", "SIGNUP", devCode!);
    expect(first.ok).toBe(true);

    const second = await verifyCode("0700000009", "SIGNUP", devCode!);
    expect(second.ok).toBe(false);
  });

  it("refuse un code incorrect et compte les tentatives", async () => {
    const { devCode } = await issueVerificationCode("0700000010", "RESET");
    const wrong = devCode === "000000" ? "111111" : "000000";

    const result = await verifyCode("0700000010", "RESET", wrong);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/incorrect/i);

    const record = await prisma.verificationCode.findFirst({
      where: { phone: "0700000010", purpose: "RESET" },
    });
    expect(record?.attempts).toBe(1);
  });

  it("invalide l'ancien code quand un nouveau est demandé", async () => {
    const first = await issueVerificationCode("0700000011", "SIGNUP");
    const second = await issueVerificationCode("0700000011", "SIGNUP");

    const old = await verifyCode("0700000011", "SIGNUP", first.devCode!);
    expect(old.ok).toBe(false);

    const fresh = await verifyCode("0700000011", "SIGNUP", second.devCode!);
    expect(fresh.ok).toBe(true);
  });

  it("refuse un code expiré", async () => {
    const { devCode } = await issueVerificationCode("0700000012", "RESET");
    await prisma.verificationCode.updateMany({
      where: { phone: "0700000012" },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const result = await verifyCode("0700000012", "RESET", devCode!);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/expir/i);
  });

  it("limite le nombre de demandes de code", async () => {
    for (let index = 0; index < 5; index += 1) {
      const result = await issueVerificationCode("0700000013", "SIGNUP");
      expect(result.ok).toBe(true);
    }
    const blocked = await issueVerificationCode("0700000013", "SIGNUP");
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toMatch(/Trop de demandes/);
  });
});
