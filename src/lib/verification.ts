import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";
import { sendSms } from "@/lib/sms";

export type VerificationPurpose = "SIGNUP" | "RESET" | "PHONE_CHANGE";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000;

function hashCode(phone: string, purpose: VerificationPurpose, code: string): string {
  return createHash("sha256")
    .update(`${phone}:${purpose}:${code}:${process.env.AUTH_SECRET ?? "dev"}`)
    .digest("hex");
}

function normalize(code: string): string {
  return code.replace(/\D/g, "").slice(0, 6);
}

/**
 * Genere un code a 6 chiffres, invalide les precedents et l'envoie par SMS.
 * Le code en clair n'est renvoye qu'en developpement, pour pouvoir tester.
 */
export async function issueVerificationCode(
  phone: string,
  purpose: VerificationPurpose,
): Promise<{ ok: boolean; error?: string; devCode?: string }> {
  const limit = await consumeRateLimit(`otp:${purpose}:${phone}`, MAX_CODES_PER_WINDOW, WINDOW_MS);
  if (!limit.allowed) {
    return {
      ok: false,
      error: `Trop de demandes. Reessayez dans ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  await prisma.verificationCode.updateMany({
    where: { phone, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.verificationCode.create({
    data: {
      phone,
      purpose,
      codeHash: hashCode(phone, purpose, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  await sendSms(
    phone,
    `Vitrine : votre code de verification est ${code}. Il expire dans ${CODE_TTL_MINUTES} minutes.`,
  );

  return {
    ok: true,
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  };
}

/** Verifie un code et le consomme s'il est valide. */
export async function verifyCode(
  phone: string,
  purpose: VerificationPurpose,
  rawCode: string,
): Promise<{ ok: boolean; error?: string }> {
  const code = normalize(rawCode);
  if (code.length !== 6) return { ok: false, error: "Le code contient 6 chiffres." };

  const record = await prisma.verificationCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, error: "Aucun code en cours. Demandez un nouveau code." };
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "Ce code a expire. Demandez un nouveau code." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Trop de tentatives. Demandez un nouveau code." };
  }

  if (record.codeHash !== hashCode(phone, purpose, code)) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - record.attempts - 1;
    return {
      ok: false,
      error: remaining > 0 ? `Code incorrect. Il reste ${remaining} essai(s).` : "Code incorrect.",
    };
  }

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true };
}
