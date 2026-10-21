"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMerchant } from "@/lib/auth";
import { isOrderStatus, slugify } from "@/lib/format";
import { PLANS, type PlanId } from "@/lib/plans";
import { isThemeId } from "@/lib/themes";

export type StoreState = { error?: string; success?: string };

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateStore(_prev: StoreState, formData: FormData): Promise<StoreState> {
  const merchant = await requireMerchant();

  const storeName = str(formData, "storeName");
  const slug = slugify(str(formData, "slug"));
  if (storeName.length < 2) return { error: "Le nom de la boutique est trop court." };
  if (slug.length < 3) return { error: "Le lien doit contenir au moins 3 caractères." };

  const taken = await prisma.merchant.findFirst({
    where: { slug, NOT: { id: merchant.id } },
  });
  if (taken) return { error: "Ce lien est déjà utilisé, choisis-en un autre." };

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      storeName,
      slug,
      bio: str(formData, "bio") || null,
      city: str(formData, "city") || null,
      whatsapp: str(formData, "whatsapp").replace(/\D/g, "") || merchant.whatsapp,
      callNumber: str(formData, "callNumber").replace(/\D/g, "") || null,
      logoUrl: str(formData, "logoUrl") || null,
    },
  });

  revalidatePath("/tableau-de-bord/boutique");
  revalidatePath(`/s/${slug}`);
  return { success: "Boutique mise à jour." };
}

export async function updateTheme(formData: FormData): Promise<void> {
  const merchant = await requireMerchant();
  const theme = str(formData, "theme");
  if (!isThemeId(theme)) return;

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { theme },
  });

  revalidatePath("/tableau-de-bord/boutique");
  revalidatePath(`/s/${merchant.slug}`);
}

export async function updatePlan(formData: FormData): Promise<void> {
  const merchant = await requireMerchant();
  const plan = str(formData, "plan") as PlanId;
  if (!(plan in PLANS)) return;
  await prisma.merchant.update({ where: { id: merchant.id }, data: { plan } });
  revalidatePath("/tableau-de-bord/abonnement");
  revalidatePath("/tableau-de-bord");
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const merchant = await requireMerchant();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!isOrderStatus(status)) return;

  const order = await prisma.order.findFirst({ where: { id, merchantId: merchant.id } });
  if (!order) return;

  // Si la commande est annulée après coup, on remet les articles en stock.
  if (status === "ANNULEE" && order.status !== "ANNULEE") {
    try {
      const items = JSON.parse(order.items) as { productId: string; quantity: number }[];
      await prisma.$transaction(
        items
          .filter((item) => item.productId)
          .map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            }),
          ),
      );
    } catch {
      // stock non critique : on n'empêche pas le changement de statut
    }
  }

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/tableau-de-bord/commandes");
  revalidatePath("/tableau-de-bord");
}
