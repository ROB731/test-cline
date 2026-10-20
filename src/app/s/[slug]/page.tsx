import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { whatsappLink, telLink, formatFCFA } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { parseImages } from "@/lib/types";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { IconPhone, IconWhatsApp } from "@/components/icons";

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
    title: `${merchant.storeName} — Vitrine`,
    description:
      merchant.bio ??
      `Découvre les articles de ${merchant.storeName} et commande directement sur WhatsApp.`,
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
  const cheapest = products.reduce<number | null>(
    (min, product) => (min === null || product.price < min ? product.price : min),
    null,
  );

  return (
    <div className="min-h-dvh pb-28">
      <header className="relative overflow-hidden bg-brand-900 pb-16 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 85% 30%, rgba(251,191,36,0.35), transparent 40%)",
          }}
        />
        <div className="container-page relative flex items-center justify-between py-4">
          <span className="text-sm font-extrabold tracking-tight">
            Vitrine<span className="text-accent-400">.</span>
          </span>
          <a
            href={whatsappLink(
              merchant.whatsapp,
              `Bonjour ${merchant.storeName}, je viens de votre vitrine.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="badge border-white/25 bg-white/10 text-white"
          >
            <IconWhatsApp className="h-3.5 w-3.5" /> Écrire
          </a>
        </div>

        <div className="container-page relative mt-6 flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left sm:gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-2xl font-black">
            {merchant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={merchant.logoUrl} alt={merchant.storeName} className="h-full w-full object-cover" />
            ) : (
              merchant.storeName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="mt-3 sm:mt-0">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {merchant.storeName}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              {merchant.city || "Côte d'Ivoire"} · {products.length} article
              {products.length > 1 ? "s" : ""}
              {cheapest !== null ? ` · dès ${formatFCFA(cheapest)}` : ""}
            </p>
            {merchant.bio && (
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/80 sm:mx-0">
                {merchant.bio}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="container-page -mt-10">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:flex">
          <a
            href={whatsappLink(
              merchant.whatsapp,
              `Bonjour ${merchant.storeName}, je viens de votre vitrine.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="btn btn-wa w-full shadow-sm sm:w-auto"
          >
            <IconWhatsApp className="h-4 w-4" /> WhatsApp
          </a>
          {merchant.callNumber ? (
            <a href={telLink(merchant.callNumber)} className="btn btn-accent w-full shadow-sm sm:w-auto">
              <IconPhone className="h-4 w-4" /> Appeler
            </a>
          ) : (
            <a href={telLink(merchant.whatsapp)} className="btn btn-accent w-full shadow-sm sm:w-auto">
              <IconPhone className="h-4 w-4" /> Appeler
            </a>
          )}
        </div>

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

        <footer className="mt-12 border-t border-line py-8 text-center text-xs text-muted">
          <p>
            Paiement à la livraison, Orange Money, MTN MoMo ou Wave — à convenir directement avec le
            vendeur.
          </p>
          {plan.showBadge ? (
            <p className="mt-3">
              Vitrine gratuite propulsée par{" "}
              <Link href="/" className="font-bold text-brand-700 hover:underline">
                Vitrine
              </Link>
            </p>
          ) : (
            <p className="mt-3 font-semibold text-brand-700">Boutique {merchant.storeName}</p>
          )}
        </footer>
      </div>
    </div>
  );
}
