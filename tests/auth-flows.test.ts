import { beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  userAgent: "Mozilla/5.0 (Linux; Android 13) Chrome/120.0 Safari/537.36",
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.cookies.has(name) ? { name, value: jar.cookies.get(name) as string } : undefined,
    set: (name: string, value: string) => {
      jar.cookies.set(name, value);
    },
    delete: (name: string) => {
      jar.cookies.delete(name);
    },
    has: (name: string) => jar.cookies.has(name),
  }),
  headers: async () => new Headers({ "user-agent": jar.userAgent, "x-forwarded-for": "127.0.0.1" }),
}));

vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const { prisma } = await import("@/lib/db");
const actions = await import("@/lib/actions/auth");
const { verifyPassword } = await import("@/lib/auth");

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const signup = {
  name: "Awa Kone",
  storeName: "Chez Awa",
  phone: "0701234567",
  whatsapp: "0701234567",
  city: "Abidjan",
  password: "motdepasse1",
  conditions: "on",
};

async function createAccount(phone = signup.phone) {
  try {
    await actions.signUp({}, form({ ...signup, phone, whatsapp: phone }));
  } catch (error) {
    expect(String(error)).toContain("REDIRECT:/verifier-telephone");
  }
  return prisma.merchant.findUniqueOrThrow({ where: { phone } });
}

async function login(password = signup.password) {
  try {
    await actions.signIn({}, form({ phone: signup.phone, password }));
  } catch (error) {
    if (!String(error).includes("REDIRECT")) throw error;
  }
}

beforeEach(async () => {
  jar.cookies.clear();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.merchant.deleteMany();
});

describe("inscription", () => {
  it("crée le compte, ouvre une session et redirige vers la vérification", async () => {
    const merchant = await createAccount();

    expect(merchant.phoneVerified).toBe(false);
    expect(merchant.plan).toBe("FREE");
    expect(await prisma.session.count({ where: { merchantId: merchant.id } })).toBe(1);
    expect(jar.cookies.get("vitrine_session")).toBeTruthy();
  });

  it("refuse un numéro déjà utilisé", async () => {
    await createAccount();
    jar.cookies.clear();

    const state = await actions.signUp({}, form({ ...signup, storeName: "Autre" }));
    expect(state.error).toMatch(/déjà/);
  });

  it("exige des conditions valides et un mot de passe solide", async () => {
    const noConditions = await actions.signUp(
      {},
      form({ ...signup, conditions: "" } as unknown as Record<string, string>),
    );
    expect(noConditions.error).toMatch(/conditions/i);

    const weak = await actions.signUp({}, form({ ...signup, password: "court" }));
    expect(weak.error).toMatch(/8 caractères/);
  });
});

describe("connexion", () => {
  it("refuse un mauvais mot de passe", async () => {
    await createAccount();
    jar.cookies.clear();

    const state = await actions.signIn({}, form({ phone: signup.phone, password: "mauvais1" }));
    expect(state.error).toMatch(/incorrect/);
    expect(jar.cookies.get("vitrine_session")).toBeUndefined();
  });

  it("bloque après cinq tentatives", async () => {
    await createAccount();
    jar.cookies.clear();

    for (let index = 0; index < 5; index += 1) {
      await actions.signIn({}, form({ phone: signup.phone, password: "mauvais1" }));
    }
    const blocked = await actions.signIn({}, form({ phone: signup.phone, password: "mauvais1" }));
    expect(blocked.error).toMatch(/Trop de tentatives/);
  });

  it("ouvre une session longue avec « rester connecté »", async () => {
    const merchant = await createAccount();
    jar.cookies.clear();

    await expect(
      actions.signIn({}, form({ phone: signup.phone, password: signup.password, remember: "on" })),
    ).rejects.toThrow("REDIRECT:/tableau-de-bord");

    const session = await prisma.session.findFirstOrThrow({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
    });
    const days = (session.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    expect(days).toBeGreaterThan(29);
    expect(session.ip).toBe("127.0.0.1");
  });
});

describe("récupération de mot de passe", () => {
  it("envoie un code, change le mot de passe et révoque les sessions", async () => {
    const merchant = await createAccount();
    await login();
    expect(await prisma.session.count({ where: { merchantId: merchant.id } })).toBe(2);

    const requested = await actions.requestPasswordReset({}, form({ phone: signup.phone }));
    expect(requested.step).toBe("code");
    expect(requested.devCode).toMatch(/^\d{6}$/);

    await expect(
      actions.resetPassword(
        {},
        form({ phone: signup.phone, code: requested.devCode as string, password: "nouveaupass2" }),
      ),
    ).rejects.toThrow("REDIRECT:/connexion?reinitialise=1");

    const updated = await prisma.merchant.findUniqueOrThrow({ where: { id: merchant.id } });
    expect(verifyPassword("nouveaupass2", updated.passwordHash)).toBe(true);
    expect(verifyPassword(signup.password, updated.passwordHash)).toBe(false);
    expect(await prisma.session.count({ where: { merchantId: merchant.id } })).toBe(0);
  });

  it("ne révèle pas l'existence d'un numéro inconnu", async () => {
    const state = await actions.requestPasswordReset({}, form({ phone: "0709999999" }));
    expect(state.step).toBe("code");
    expect(state.success).toMatch(/Si ce numéro/);
    expect(state.devCode).toBeUndefined();
  });
});

describe("compte", () => {
  it("change le mot de passe et déconnecte les autres appareils", async () => {
    const merchant = await createAccount();
    await login();
    const firstSession = jar.cookies.get("vitrine_session");

    jar.cookies.clear();
    await login();
    const secondSession = jar.cookies.get("vitrine_session");
    expect(firstSession).not.toBe(secondSession);

    const wrong = await actions.changePassword(
      {},
      form({ currentPassword: "mauvais1", newPassword: "encoreun2" }),
    );
    expect(wrong.error).toMatch(/incorrect/);

    const ok = await actions.changePassword(
      {},
      form({ currentPassword: signup.password, newPassword: "encoreun2" }),
    );
    expect(ok.success).toBeTruthy();

    const sessions = await prisma.session.count({ where: { merchantId: merchant.id } });
    expect(sessions).toBe(1);
  });

  it("supprime le compte après confirmation explicite", async () => {
    const merchant = await createAccount();
    await login();

    const wrong = await actions.deleteAccount(
      {},
      form({ password: signup.password, confirmation: "OUI" }),
    );
    expect(wrong.error).toMatch(/SUPPRIMER/);

    await expect(
      actions.deleteAccount({}, form({ password: signup.password, confirmation: "SUPPRIMER" })),
    ).rejects.toThrow("REDIRECT:/?compte=supprime");

    expect(await prisma.merchant.findUnique({ where: { id: merchant.id } })).toBeNull();
    expect(await prisma.session.count({ where: { merchantId: merchant.id } })).toBe(0);
    expect(jar.cookies.get("vitrine_session")).toBeUndefined();
  });
});

describe("vérification du numéro", () => {
  it("envoie puis valide le code de vérification", async () => {
    const merchant = await createAccount();

    const sent = await actions.sendPhoneCode({}, new FormData());
    expect(sent.devCode).toMatch(/^\d{6}$/);

    const wrongCode = sent.devCode === "000000" ? "111111" : "000000";
    const rejected = await actions.confirmPhoneCode({}, form({ code: wrongCode }));
    expect(rejected.error).toMatch(/incorrect/i);
    expect(rejected.step).toBe("code");

    await expect(
      actions.confirmPhoneCode({}, form({ code: sent.devCode as string })),
    ).rejects.toThrow("REDIRECT:/tableau-de-bord?verifie=1");

    const updated = await prisma.merchant.findUniqueOrThrow({ where: { id: merchant.id } });
    expect(updated.phoneVerified).toBe(true);
  });

  it("change de numéro après vérification du nouveau", async () => {
    const merchant = await createAccount();

    const wrongPassword = await actions.requestPhoneChange(
      {},
      form({ password: "mauvais1", newPhone: "0707778899" }),
    );
    expect(wrongPassword.error).toMatch(/incorrect/);

    const requested = await actions.requestPhoneChange(
      {},
      form({ password: signup.password, newPhone: "0707778899" }),
    );
    expect(requested.pendingPhone).toBe("0707778899");

    const confirmed = await actions.confirmPhoneChange(
      {},
      form({ pendingPhone: "0707778899", code: requested.devCode as string }),
    );
    expect(confirmed.success).toBeTruthy();

    const updated = await prisma.merchant.findUniqueOrThrow({ where: { id: merchant.id } });
    expect(updated.phone).toBe("0707778899");
    expect(updated.phoneVerified).toBe(true);
  });

  it("refuse un numéro déjà pris", async () => {
    await createAccount("0701234567");
    jar.cookies.clear();
    await createAccount("0701234500");
    jar.cookies.clear();
    await loginFor("0701234500", signup.password);

    const state = await actions.requestPhoneChange(
      {},
      form({ password: signup.password, newPhone: "0701234567" }),
    );
    expect(state.error).toMatch(/déjà utilisé/);
  });
});

async function loginFor(phone: string, password: string) {
  try {
    await actions.signIn({}, form({ phone, password }));
  } catch (error) {
    if (!String(error).includes("REDIRECT")) throw error;
  }
}
