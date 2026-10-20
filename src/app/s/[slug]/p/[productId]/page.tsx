import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatFCFA, whatsappLink } from "@/lib/format";
import { parseImages } from "@/lib/types";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductActions } from "@/components/store/ProductActions";
import { IconWhatsApp } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}): Promise<Metadata> {
  const { slug, productId } = await params;
  const product = await prisma.product.findFirst({
    where: { id: productId, merchant: { slug }, active: true },
    include: { merchant: true },
  });
  if (!product) return { title: "Article introuvable — Vitrine" };
  return {
    title: `${product.name} — ${product.merchant.storeName}`,
    description: product.description ?? `${product.name} à ${formatFCFA(product.price)}.`,
  };
}

export default async function ProduitPublic({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;

  const merchant = await prisma.merchant.findUnique({ where: { slug } });
  if (!merchant) notFound();

  const product = await prisma.product.findFirst({
    where: { id: productId, merchantId: merchant.id, active: true },
  });
  if (!product) notFound();

  const images = parseImages(product.images);
  const message = `Bonjour ${merchant.storeName}, je suis intéressé(e) par :\n- ${product.name} (${formatFCFA(product.price)})\nEst-il toujours disponible ?`;

  return (
    <div className="min-h-dvh pb-16">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between">
          <Link href={`/s/${slug}`} className="text-sm font-semibold text-muted hover:text-ink">
            ← {merchant.storeName}
          </Link>
          <span className="text-xs font-bold tracking-tight text-brand-700">Vitrine.</span>
        </div>
      </header>

      <div className="container-page grid gap-8 py-6 lg:grid-cols-2 lg:py-10">
        <ProductGallery images={images} name={product.name} />

        <div className="space-y-5">
          <div>
            {product.category && (
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                {product.category}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="text-2xl font-extrabold text-brand-800">{formatFCFA(product.price)}</p>
              {product.compareAtPrice && (
                <p className="text-sm text-muted line-through">{formatFCFA(product.compareAtPrice)}</p>
              )}
            </div>
            <p className="mt-2">
              {product.stock > 0 ? (
                <span className="badge border-emerald-200 bg-emerald-50 text-emerald-800">
                  Disponible · {product.stock} en stock
                </span>
              ) : (
                <span className="badge border-rose-200 bg-rose-50 text-rose-700">
                  Épuisé pour le moment
                </span>
              )}
            </p>
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          <ProductActions
            slug={slug}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: images[0] ?? null,
              stock: product.stock,
            }}
          />

          <a
            href={whatsappLink(merchant.whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-wa w-full"
          >
            <IconWhatsApp className="h-4 w-4" />
            Poser une question sur WhatsApp
          </a>

          <ul className="space-y-2 rounded-2xl bg-white p-4 text-sm text-muted ring-1 ring-line">
            <li>✅ Paiement à la livraison, Orange Money, MTN MoMo ou Wave</li>
            <li>🚚 Livraison à {merchant.city || "Abidjan"} — délai à confirmer avec le vendeur</li>
            <li>💬 Une question ? Le vendeur répond directement sur WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
