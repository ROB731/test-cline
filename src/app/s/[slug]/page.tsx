import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { whatsappLink, telLink, formatFCFA } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { parseImages } from "@/lib/types";
import { getTheme, themeStyle } from "@/lib/themes";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { Icon, IconWhatsApp } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({ where: { slug } });
  if (!merchant) return { title: "Boutique introuvable — Vitrine" };
  return {
    title: `${merchant.storeName} — Boutique en ligne`,
    description:
      merchant.bio ??
      `Découvrez les articles de ${merchant.storeName} et commandez directement sur WhatsApp.`,
  };
}

export default async function BoutiquePublique({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ panier?: string }>;
}) {
  const { slug } = await params;
  const { panier } = await searchParams;

  const merchant = await prisma.merchant.findUnique({ where: { slug } });
  if (!merchant) notFound();

  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id, active: true },
    orderBy: [{ createdAt: "desc" }],
  });

  const plan = getPlan(merchant.plan);
  const theme = getTheme(merchant.theme);
  const cheapest = products.reduce<number | null>(
    (min, product) => (min === null || product.price < min ? product.price : min),
    null,
  );

  return (
    <div
      data-shop-theme={theme.id}
      style={themeStyle(theme)}
      className="min-h-dvh pb-28"
    >
      <header className="border-b border-[var(--shop-line)] bg-[var(--shop-surface)]">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {merchant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={merchant.logoUrl}
                alt={merchant.storeName}
                className="h-8 w-8 rounded-[var(--shop-radius)] border border-[var(--shop-line)] object-cover"
              />
            ) : (
              <span className="shop-heading flex h-8 w-8 items-center justify-center rounded-[var(--shop-radius)] bg-[var(--shop-accent)] text-[13px] text-[var(--shop-accent-ink)]">
                {merchant.storeName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="truncate text-[13px] font-medium text-[var(--shop-ink)]">
              {merchant.storeName}
            </span>
          </div>
          <a
            href={whatsappLink(
              merchant.whatsapp,
              `Bonjour ${merchant.storeName}, je vous contacte depuis votre vitrine.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--shop-accent)] hover:underline"
          >
            <IconWhatsApp className="h-3.5 w-3.5" />
            Écrire
          </a>
        </div>
      </header>

      <section className="border-b border-[var(--shop-line)] bg-[var(--shop-hero)]">
        <div className="container-page py-9 sm:py-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--shop-muted)]">
            {merchant.city || "Côte d'Ivoire"}
          </p>
          <h1 className="shop-heading mt-2 text-[34px] leading-[1.08] sm:text-[42px]">
            {merchant.storeName}
          </h1>
          {merchant.bio && (
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--shop-muted)]">
              {merchant.bio}
            </p>
          )}
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--shop-muted)]">
            <span>
              {products.length} article{products.length > 1 ? "s" : ""}
            </span>
            {cheapest !== null && (
              <>
                <span className="h-3 w-px bg-[var(--shop-line)]" />
                <span>à partir de {formatFCFA(cheapest)}</span>
              </>
            )}
            <span className="h-3 w-px bg-[var(--shop-line)]" />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--shop-accent)]" />
              Réponse sur WhatsApp
            </span>
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={whatsappLink(
                merchant.whatsapp,
                `Bonjour ${merchant.storeName}, je vous contacte depuis votre vitrine.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wa rounded-[var(--shop-radius)]"
            >
              <IconWhatsApp className="h-4 w-4" />
              Commander sur WhatsApp
            </a>
            <a href={telLink(merchant.callNumber || merchant.whatsapp)} className="shop-btn-outline">
              <Icon name="phone" className="h-4 w-4" />
              Appeler la boutique
            </a>
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        <StoreCatalog
          slug={merchant.slug}
          storeName={merchant.storeName}
          whatsapp={merchant.whatsapp}
          openCartInitially={panier === "1"}
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            image: parseImages(product.images)[0] ?? null,
            category: product.category,
            stock: product.stock,
          }))}
        />

        <footer className="mt-14 border-t border-[var(--shop-line)] pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-relaxed text-[var(--shop-muted)]">
              Paiement à la livraison, Orange Money, MTN MoMo ou Wave — à convenir avec le vendeur.
            </p>
            {plan.showBadge ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[11px] text-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
              >
                Boutique propulsée par
                <span className="shop-heading text-[13px]">Vitrine</span>
              </Link>
            ) : (
              <p className="text-[11px] text-[var(--shop-muted)]">Boutique {merchant.storeName}</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
