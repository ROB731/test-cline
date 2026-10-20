import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseImages } from "@/lib/types";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function ModifierProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const merchant = await requireMerchant();
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, merchantId: merchant.id },
  });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tableau-de-bord/produits" className="text-sm font-semibold text-muted hover:text-ink">
          ← Mes produits
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Modifier le produit</h1>
        <p className="mt-1 text-sm text-muted">Les changements sont visibles immédiatement.</p>
      </div>

      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: parseImages(product.images),
          category: product.category,
          stock: product.stock,
          active: product.active,
        }}
      />
    </div>
  );
}
