import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatFCFA, whatsappLink } from "@/lib/format";
import { parseImages } from "@/lib/types";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductActions } from "@/components/store/ProductActions";
import { Icon, IconWhatsApp } from "@/components/icons";

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
    <div className="min-h-dvh bg-white pb-16">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-page flex h-14 items-center justify-between">
          <Link
            href={`/s/${slug}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink"
          >
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            {merchant.storeName}
          </Link>
          <span className="text-[11px] text-muted">
            {product.category || "Boutique"}
          </span>
        </div>
      </header>

      <div className="container-page grid gap-8 py-6 lg:grid-cols-2 lg:gap-14 lg:py-12">
        <ProductGallery images={images} name={product.name} />

        <div>
          {product.category && (
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              {product.category}
            </p>
          )}
          <h1 className="display mt-2 text-[30px] leading-[1.1] sm:text-[36px]">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <p className="text-[22px] font-medium text-brand-800">{formatFCFA(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-[13px] text-muted line-through">
                {formatFCFA(product.compareAtPrice)}
              </p>
            )}
          </div>

          <p className="mt-3 text-[12px]">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                En stock ({product.stock} disponible{product.stock > 1 ? "s" : ""})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                Épuisé pour le moment
              </span>
            )}
          </p>

          {product.description && (
            <p className="mt-5 whitespace-pre-line border-t border-line pt-5 text-[13.5px] leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          <div className="mt-6">
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
          </div>

          <a
            href={whatsappLink(merchant.whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline mt-2.5 w-full"
          >
            <IconWhatsApp className="h-4 w-4" />
            Poser une question sur WhatsApp
          </a>

          <ul className="mt-7 space-y-3 border-t border-line pt-5">
            {[
              { icon: "card" as const, text: "Paiement à la livraison, Orange Money, MTN MoMo ou Wave" },
              { icon: "truck" as const, text: `Livraison à ${merchant.city || "Abidjan"}, délai à confirmer avec le vendeur` },
              { icon: "message" as const, text: "Une question ? Le vendeur répond directement sur WhatsApp" },
            ].map((item) => (
              <li key={item.text} className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted">
                <Icon name={item.icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
