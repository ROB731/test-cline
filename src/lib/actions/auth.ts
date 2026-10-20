"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { normalizePhone, slugify } from "@/lib/format";

export type AuthState = { error?: string };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = str(formData, "name");
  const storeName = str(formData, "storeName");
  const phone = normalizePhone(str(formData, "phone"));
  const whatsapp = normalizePhone(str(formData, "whatsapp")) || phone;
  const city = str(formData, "city");
  const password = str(formData, "password");

  if (name.length < 2) return { error: "Indique ton nom (2 caractères minimum)." };
  if (storeName.length < 2) return { error: "Indique le nom de ta boutique." };
  if (phone.length < 8) return { error: "Numéro de téléphone invalide. Exemple : 0700000000." };
  if (password.length < 6) return { error: "Le mot de passe doit faire 6 caractères minimum." };

  const existing = await prisma.merchant.findUnique({ where: { phone } });
  if (existing) {
    return { error: "Ce numéro a déjà un compte. Connecte-toi plutôt." };
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
    },
  });

  await createSession(merchant.id);
  redirect("/tableau-de-bord?bienvenue=1");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const phone = normalizePhone(str(formData, "phone"));
  const password = str(formData, "password");

  if (!phone || !password) return { error: "Renseigne ton numéro et ton mot de passe." };

  const merchant = await prisma.merchant.findUnique({ where: { phone } });
  if (!merchant || !verifyPassword(password, merchant.passwordHash)) {
    return { error: "Numéro ou mot de passe incorrect." };
  }

  await createSession(merchant.id);
  redirect("/tableau-de-bord");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
