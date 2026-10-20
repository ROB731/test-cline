import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "vitrine_session";
const REMEMBER_DAYS = 30;
const DEFAULT_DAYS = 1;

/* ------------------------------- Mots de passe ------------------------------ */

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

export function passwordIssues(password: string): string | null {
  if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}

/* --------------------------------- Sessions -------------------------------- */

function hashToken(token: string): string {
  return createHash("sha256").update(`${token}:${process.env.AUTH_SECRET ?? "dev"}`).digest("hex");
}

async function requestContext() {
  try {
    const store = await headers();
    return {
      userAgent: store.get("user-agent")?.slice(0, 255) ?? null,
      ip:
        store.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        store.get("x-real-ip") ??
        null,
    };
  } catch {
    return { userAgent: null, ip: null };
  }
}

export async function createSession(merchantId: string, options?: { remember?: boolean }) {
  const days = options?.remember ? REMEMBER_DAYS : DEFAULT_DAYS;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const context = await requestContext();

  await prisma.session.create({
    data: {
      merchantId,
      tokenHash: hashToken(token),
      userAgent: context.userAgent,
      ip: context.ip,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return { expiresAt };
}

export async function getCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { merchant: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  // Rafraichit la date de derniere activite au plus une fois par heure.
  if (Date.now() - session.lastSeenAt.getTime() > 60 * 60 * 1000) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
      .catch(() => undefined);
  }

  return session;
}

export async function getCurrentMerchant() {
  const session = await getCurrentSession();
  return session?.merchant ?? null;
}

export async function requireMerchant(nextPath?: string) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    const target = nextPath ? `/connexion?next=${encodeURIComponent(nextPath)}` : "/connexion";
    redirect(target);
  }
  return merchant;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(COOKIE_NAME);
}

export async function revokeAllSessions(merchantId: string) {
  await prisma.session.deleteMany({ where: { merchantId } });
}

export async function revokeOtherSessions(merchantId: string) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const keep = token ? hashToken(token) : "";
  await prisma.session.deleteMany({
    where: { merchantId, NOT: { tokenHash: keep } },
  });
}

export async function revokeSession(sessionId: string, merchantId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId, merchantId } });
}

export async function listSessions(merchantId: string) {
  const current = await getCurrentSession();
  const sessions = await prisma.session.findMany({
    where: { merchantId, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: "desc" },
  });
  return sessions.map((session) => ({
    ...session,
    current: session.id === current?.id,
  }));
}

export function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Appareil inconnu";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : /Firefox\//.test(userAgent)
            ? "Firefox"
            : "Navigateur";
  const system = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iOS/.test(userAgent)
      ? "iOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return system ? `${browser} sur ${system}` : browser;
}
