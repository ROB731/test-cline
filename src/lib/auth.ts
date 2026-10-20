import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/format";

const COOKIE_NAME = "vitrine_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeSession(merchantId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ mid: merchantId, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      mid?: string;
      exp?: number;
    };
    if (!data.mid || !data.exp || data.exp < Date.now()) return null;
    return data.mid;
  } catch {
    return null;
  }
}

export async function createSession(merchantId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(merchantId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentMerchant() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const merchantId = decodeSession(token);
  if (!merchantId) return null;
  return prisma.merchant.findUnique({ where: { id: merchantId } });
}

export async function requireMerchant() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/connexion");
  return merchant;
}

export { normalizePhone };
