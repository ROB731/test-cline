"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export type PublicOrderState = {
  error?: string;
  order?: { reference: string; total: number };
};

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Commande publique passée depuis la vitrine.
 * Aucune authentification : le client n'a pas de compte.
 * Le stock est décrémenté, et les prix sont revalidés côté serveur
 * (on ne fait jamais confiance au panier envoyé par le navigateur).
 */
export async function createPublicOrder(
  _prev: PublicOrderState,
  formData: FormData,
): Promise<PublicOrderState> {
  const slug = str(formData, "slug");
  const customerName = str(formData, "customerName");
  const customerPhone = str(formData, "customerPhone").replace(/\D/g, "");
  const deliveryNote = str(formData, "deliveryNote");

  if (customerName.length < 2) return { error: "Indique ton nom pour la livraison." };
  if (customerPhone.length < 8) return { error: "Indique un numéro de téléphone valide." };

  let rawItems: { productId: string; quantity: number }[] = [];
  try {
    const parsed = JSON.parse(str(formData, "items") || "[]");
    if (Array.isArray(parsed)) rawItems = parsed;
  } catch {
    return { error: "Panier illisible, réessaie." };
  }
  if (rawItems.length === 0) return { error: "Ton panier est vide." };

  const merchant = await prisma.merchant.findUnique({ where: { slug } });
  if (!merchant) return { error: "Boutique introuvable." };

  const ids = rawItems.map((item) => item.productId).filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, merchantId: merchant.id, active: true },
  });

  const items: { productId: string; name: string; price: number; quantity: number }[] = [];
  for (const raw of rawItems) {
    const product = products.find((p) => p.id === raw.productId);
    if (!product) return { error: "Un article n'est plus disponible." };
    const quantity = Math.min(Math.max(1, Math.floor(Number(raw.quantity) || 0)), 20);
    if (quantity > product.stock) {
      return { error: `Stock insuffisant pour « ${product.name} » (${product.stock} restant).` };
    }
    items.push({ productId: product.id, name: product.name, price: product.price, quantity });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const now = new Date();
  const reference =
    `CMD-${`${now.getFullYear()}`.slice(2)}${`${now.getMonth() + 1}`.padStart(2, "0")}-` +
    Math.random().toString(36).slice(2, 5).toUpperCase();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          reference,
          merchantId: merchant.id,
          customerName,
          customerPhone,
          deliveryNote: deliveryNote || null,
          items: JSON.stringify(items),
          total,
        },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });
  } catch {
    return { error: "La commande n'a pas pu être enregistrée. Réessaie." };
  }

  revalidatePath("/tableau-de-bord/commandes");
  revalidatePath("/tableau-de-bord");
  revalidatePath(`/s/${slug}`);

  return { order: { reference, total } };
}
