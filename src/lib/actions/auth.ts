"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentSession,
  hashPassword,
  passwordIssues,
  requireMerchant,
  revokeAllSessions,
  revokeOtherSessions,
  revokeSession,
  verifyPassword,
} from "@/lib/auth";
import { normalizePhone, slugify } from "@/lib/format";
import { consumeRateLimit, formatRetry } from "@/lib/rate-limit";
import { issueVerificationCode, verifyCode } from "@/lib/verification";

export type AuthState = {
  error?: string;
  success?: string;
  devCode?: string;
  step?: "code";
  phone?: string;
  pendingPhone?: string;
};

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeNext(value: string): string {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/tableau-de-bord";
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "boutique";
  let candidate = root;
  let suffix = 2;
  while (await prisma.merchant.findUnique({ where: { slug: candidate } })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/* ------------------------------- Inscription ------------------------------- */

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = str(formData, "name");
  const storeName = str(formData, "storeName");
  const phone = normalizePhone(str(formData, "phone"));
  const whatsapp = normalizePhone(str(formData, "whatsapp")) || phone;
  const city = str(formData, "city");
  const password = str(formData, "password");
  const accepted = formData.get("conditions");

  if (name.length < 2) return { error: "Indiquez votre nom (2 caractères minimum)." };
  if (storeName.length < 2) return { error: "Indiquez le nom de votre boutique." };
  if (phone.length < 8) return { error: "Numéro de téléphone invalide. Exemple : 0700000000." };
  if (whatsapp.length < 8) return { error: "Le numéro WhatsApp est invalide." };
  if (!accepted) return { error: "Vous devez accepter les conditions d'utilisation." };

  const issues = passwordIssues(password);
  if (issues) return { error: issues };

  if (await prisma.merchant.findUnique({ where: { phone } })) {
    return { error: "Ce numéro possède déjà un compte. Connectez-vous plutôt." };
  }

  const merchant = await prisma.merchant.create({
    data: {
      name,
      storeName,
      phone,
      whatsapp,
      city: city || null,
      passwordHash: hashPassword(password),
      slug: await uniqueSlug(storeName),
      phoneVerified: false,
    },
  });

  await createSession(merchant.id);
  redirect("/verifier-telephone?bienvenue=1");
}

/* -------------------------------- Connexion -------------------------------- */

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const phone = normalizePhone(str(formData, "phone"));
  const password = str(formData, "password");
  const remember = formData.get("remember") === "on";
  const next = safeNext(str(formData, "next"));

  if (!phone || !password) return { error: "Renseignez votre numéro et votre mot de passe." };

  const limit = await consumeRateLimit(`login:${phone}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      error: `Trop de tentatives. Réessayez dans ${formatRetry(limit.retryAfter)}.`,
    };
  }

  const merchant = await prisma.merchant.findUnique({ where: { phone } });
  if (!merchant || !verifyPassword(password, merchant.passwordHash)) {
    return { error: "Numéro ou mot de passe incorrect." };
  }

  await createSession(merchant.id, { remember });
  await prisma.merchant.update({ where: { id: merchant.id }, data: { lastLoginAt: new Date() } });

  redirect(next);
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

/* ---------------------------- Vérification du numéro ---------------------------- */

export async function sendPhoneCode(_prev: AuthState, _formData: FormData): Promise<AuthState> {
  const merchant = await requireMerchant();
  if (merchant.phoneVerified) return { success: "Votre numéro est déjà vérifié." };

  const result = await issueVerificationCode(merchant.phone, "SIGNUP");
  if (!result.ok) return { error: result.error };

  return {
    step: "code",
    phone: merchant.phone,
    success: "Un code à 6 chiffres vient de vous être envoyé par SMS.",
    devCode: result.devCode,
  };
}

export async function confirmPhoneCode(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const merchant = await requireMerchant();
  const code = str(formData, "code");

  const result = await verifyCode(merchant.phone, "SIGNUP", code);
  if (!result.ok) return { error: result.error, step: "code", phone: merchant.phone };

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { phoneVerified: true },
  });

  revalidatePath("/tableau-de-bord");
  redirect("/tableau-de-bord?verifie=1");
}

/* --------------------------- Mot de passe oublié --------------------------- */

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phone = normalizePhone(str(formData, "phone"));
  if (phone.length < 8) return { error: "Numéro de téléphone invalide." };

  const limit = await consumeRateLimit(`reset:${phone}`, 3, 15 * 60 * 1000);
  if (!limit.allowed) {
    return { error: `Trop de demandes. Réessayez dans ${formatRetry(limit.retryAfter)}.` };
  }

  const merchant = await prisma.merchant.findUnique({ where: { phone } });
  const generic = "Si ce numéro est associé à un compte, un code vient d'être envoyé par SMS.";

  if (!merchant) {
    return { step: "code", phone, success: generic };
  }

  const result = await issueVerificationCode(phone, "RESET");
  if (!result.ok) return { error: result.error };

  return { step: "code", phone, success: generic, devCode: result.devCode };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const phone = normalizePhone(str(formData, "phone"));
  const code = str(formData, "code");
  const password = str(formData, "password");

  const issues = passwordIssues(password);
  if (issues) return { error: issues, step: "code", phone };

  const result = await verifyCode(phone, "RESET", code);
  if (!result.ok) return { error: result.error, step: "code", phone };

  const merchant = await prisma.merchant.findUnique({ where: { phone } });
  if (!merchant) return { error: "Ce code n'est plus valide.", step: "code", phone };

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { passwordHash: hashPassword(password) },
  });

  // Toutes les sessions existantes sont révoquées après un changement de mot de passe.
  await revokeAllSessions(merchant.id);

  redirect("/connexion?reinitialise=1");
}

/* -------------------------------- Compte -------------------------------- */

export async function changePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const current = str(formData, "currentPassword");
  const next = str(formData, "newPassword");

  if (!verifyPassword(current, session.merchant.passwordHash)) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const issues = passwordIssues(next);
  if (issues) return { error: issues };
  if (current === next) return { error: "Le nouveau mot de passe doit être différent." };

  await prisma.merchant.update({
    where: { id: session.merchantId },
    data: { passwordHash: hashPassword(next) },
  });

  await revokeOtherSessions(session.merchantId);
  return { success: "Mot de passe modifié. Les autres appareils ont été déconnectés." };
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const merchant = await requireMerchant();
  const name = str(formData, "name");
  const city = str(formData, "city");
  const email = str(formData, "email");

  if (name.length < 2) return { error: "Indiquez votre nom (2 caractères minimum)." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Adresse e-mail invalide." };
  }

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { name, city: city || null, email: email || null },
  });

  revalidatePath("/tableau-de-bord/compte");
  return { success: "Profil mis à jour." };
}

export async function requestPhoneChange(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const password = str(formData, "password");
  const newPhone = normalizePhone(str(formData, "newPhone"));

  if (!verifyPassword(password, session.merchant.passwordHash)) {
    return { error: "Mot de passe incorrect." };
  }
  if (newPhone.length < 8) return { error: "Nouveau numéro invalide." };
  if (newPhone === session.merchant.phone) return { error: "C'est déjà votre numéro actuel." };

  const existing = await prisma.merchant.findUnique({ where: { phone: newPhone } });
  if (existing) return { error: "Ce numéro est déjà utilisé par un autre compte." };

  const result = await issueVerificationCode(newPhone, "PHONE_CHANGE");
  if (!result.ok) return { error: result.error };

  return {
    pendingPhone: newPhone,
    success: "Un code a été envoyé au nouveau numéro.",
    devCode: result.devCode,
  };
}

export async function confirmPhoneChange(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const newPhone = normalizePhone(str(formData, "pendingPhone"));
  const code = str(formData, "code");

  if (!newPhone) return { error: "Numéro introuvable, recommencez." };

  const result = await verifyCode(newPhone, "PHONE_CHANGE", code);
  if (!result.ok) return { error: result.error, pendingPhone: newPhone };

  const clash = await prisma.merchant.findUnique({ where: { phone: newPhone } });
  if (clash) return { error: "Ce numéro vient d'être utilisé par un autre compte." };

  await prisma.merchant.update({
    where: { id: session.merchantId },
    data: { phone: newPhone, phoneVerified: true },
  });

  revalidatePath("/tableau-de-bord/compte");
  return { success: "Numéro de téléphone mis à jour." };
}

export async function revokeOtherSessionsAction(): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;
  await revokeOtherSessions(session.merchantId);
  revalidatePath("/tableau-de-bord/compte");
}

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;
  const id = str(formData, "id");
  if (!id) return;
  await revokeSession(id, session.merchantId);
  revalidatePath("/tableau-de-bord/compte");
}

export async function deleteAccount(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée. Reconnectez-vous." };

  const password = str(formData, "password");
  const confirmation = str(formData, "confirmation");

  if (!verifyPassword(password, session.merchant.passwordHash)) {
    return { error: "Mot de passe incorrect." };
  }
  if (confirmation !== "SUPPRIMER") {
    return { error: "Tapez SUPPRIMER pour confirmer la suppression." };
  }

  await revokeAllSessions(session.merchantId);
  await prisma.merchant.delete({ where: { id: session.merchantId } });
  await destroySession();

  redirect("/?compte=supprime");
}
