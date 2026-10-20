import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseImages } from "@/lib/types";
import { ProductForm } from "@/components/ProductForm";
import { Icon } from "@/components/icons";

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
        <Link
          href="/tableau-de-bord/produits"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" />
          Produits
        </Link>
        <h1 className="display mt-2 text-[30px] leading-tight">Modifier le produit</h1>
        <p className="mt-1 text-[13px] text-muted">Les modifications sont visibles immédiatement.</p>
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
