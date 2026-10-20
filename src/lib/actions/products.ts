"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMerchant } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

export type ProductState = { error?: string };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toAmount(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
}

function imageList(formData: FormData): string {
  const raw = str(formData, "images");
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return "[]";
    const clean = parsed
      .filter((item): item is string => typeof item === "string" && item.length > 0)
      .slice(0, 6);
    return JSON.stringify(clean);
  } catch {
    return "[]";
  }
}

function validate(formData: FormData, images: string) {
  const name = str(formData, "name");
  const price = toAmount(str(formData, "price"));
  if (name.length < 2) return { error: "Le nom du produit est trop court." };
  if (price <= 0) return { error: "Indique un prix supérieur à 0 FCFA." };
  if (images === "[]") return { error: "Ajoute au moins une photo du produit." };
  return { name, price };
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const merchant = await requireMerchant();
  const count = await prisma.product.count({ where: { merchantId: merchant.id } });
  const plan = getPlan(merchant.plan);
  if (count >= plan.maxProducts) {
    return {
      error: `Ton plan ${plan.label} est limité à ${plan.maxProducts} produits. Passe au plan supérieur depuis l'onglet Abonnement.`,
    };
  }

  const images = imageList(formData);
  const result = validate(formData, images);
  if ("error" in result) return { error: result.error };

  const compareAt = toAmount(str(formData, "compareAtPrice"));

  await prisma.product.create({
    data: {
      merchantId: merchant.id,
      name: result.name,
      description: str(formData, "description") || null,
      price: result.price,
      compareAtPrice: compareAt > result.price ? compareAt : null,
      images,
      category: str(formData, "category") || null,
      stock: Math.max(0, Number.parseInt(str(formData, "stock") || "0", 10) || 0),
      active: str(formData, "active") === "on",
    },
  });

  revalidatePath("/tableau-de-bord/produits");
  revalidatePath("/tableau-de-bord");
  redirect("/tableau-de-bord/produits?cree=1");
}

export async function updateProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const merchant = await requireMerchant();
  const id = str(formData, "id");
  const existing = await prisma.product.findFirst({ where: { id, merchantId: merchant.id } });
  if (!existing) return { error: "Produit introuvable." };

  const images = imageList(formData);
  const result = validate(formData, images);
  if ("error" in result) return { error: result.error };

  const compareAt = toAmount(str(formData, "compareAtPrice"));

  await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: result.name,
      description: str(formData, "description") || null,
      price: result.price,
      compareAtPrice: compareAt > result.price ? compareAt : null,
      images,
      category: str(formData, "category") || null,
      stock: Math.max(0, Number.parseInt(str(formData, "stock") || "0", 10) || 0),
      active: str(formData, "active") === "on",
    },
  });
  revalidatePath("/tableau-de-bord/produits");
  revalidatePath(`/s/${merchant.slug}`);
  redirect("/tableau-de-bord/produits?maj=1");
}

export async function deleteProduct(formData: FormData) {
  const merchant = await requireMerchant();
  const id = str(formData, "id");
  await prisma.product.deleteMany({ where: { id, merchantId: merchant.id } });
  revalidatePath("/tableau-de-bord/produits");
  revalidatePath("/tableau-de-bord");
}

export async function toggleProduct(formData: FormData) {
  const merchant = await requireMerchant();
  const id = str(formData, "id");
  const product = await prisma.product.findFirst({ where: { id, merchantId: merchant.id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { active: !product.active } });
  revalidatePath("/tableau-de-bord/produits");
  revalidatePath(`/s/${merchant.slug}`);
}
