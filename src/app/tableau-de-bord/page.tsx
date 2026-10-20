import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatFCFA } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { parseImages, parseItems } from "@/lib/types";
import { StoreLink } from "@/components/StoreLink";
import { IconPlus } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const merchant = await requireMerchant();
  const { bienvenue } = await searchParams;
  const plan = getPlan(merchant.plan);

  const [productCount, orders, revenue, lowStock, newOrders, delivered] = await Promise.all([
    prisma.product.count({ where: { merchantId: merchant.id } }),
    prisma.order.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.aggregate({
      where: { merchantId: merchant.id, status: { not: "ANNULEE" } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { merchantId: merchant.id, stock: { lte: 2 }, active: true },
      orderBy: { stock: "asc" },
      take: 4,
    }),
    prisma.order.count({ where: { merchantId: merchant.id, status: "NOUVELLE" } }),
    prisma.order.count({ where: { merchantId: merchant.id, status: "LIVREE" } }),
  ]);

  const firstName = merchant.name.split(" ")[0];

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Bonjour {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            {productCount === 0
              ? "Ta vitrine est prête. Ajoute ton premier produit pour commencer."
              : `Tu as ${productCount} produit${productCount > 1 ? "s" : ""} en ligne.`}
          </p>
        </div>
        <Link href="/tableau-de-bord/produits/nouveau" className="btn btn-primary shrink-0">
          <IconPlus className="h-4 w-4" />
          Ajouter un produit
        </Link>
      </div>

      {bienvenue && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="font-bold text-brand-900">Bienvenue sur Vitrine 🎉</p>
          <p className="mt-1 text-sm text-brand-900/80">
            Ton lien est actif. Ajoute tes produits, puis partage-le dans ta bio Instagram et tes
            statuts WhatsApp. Les commandes arriveront automatiquement ici.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Chiffre d'affaires", value: formatFCFA(revenue._sum.total ?? 0), hint: `${delivered} commande(s) livrée(s)` },
          { label: "Nouvelles commandes", value: `${newOrders}`, hint: "à traiter" },
          { label: "Produits", value: `${productCount}/${plan.maxProducts === Number.POSITIVE_INFINITY ? "∞" : plan.maxProducts}`, hint: `plan ${plan.label}` },
          { label: "Stock faible", value: `${lowStock.length}`, hint: "articles à réapprovisionner" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-2 text-xl font-extrabold sm:text-2xl">{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted">{stat.hint}</p>
          </div>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="font-bold">Ton lien de boutique</h2>
        <p className="mt-1 text-sm text-muted">
          Mets-le dans ta bio Instagram, tes statuts WhatsApp et ta page Facebook.
        </p>
        <div className="mt-3">
          <StoreLink slug={merchant.slug} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-bold">Dernières commandes</h2>
            <Link href="/tableau-de-bord/commandes" className="text-sm font-semibold text-brand-700 hover:underline">
              Tout voir
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl">🛒</p>
              <p className="mt-2 font-semibold">Aucune commande pour l&apos;instant</p>
              <p className="mt-1 text-sm text-muted">
                Partage ton lien : la première vente arrive souvent le jour même.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((order) => {
                const items = parseItems(order.items);
                return (
                  <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{order.customerName}</p>
                      <p className="truncate text-xs text-muted">
                        {order.reference} · {items.reduce((n, i) => n + i.quantity, 0)} article(s) ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold">{formatFCFA(order.total)}</p>
                      <p className="text-[11px] font-semibold text-brand-700">{order.status}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-bold">Stock à surveiller</h2>
            <Link href="/tableau-de-bord/produits" className="text-sm font-semibold text-brand-700 hover:underline">
              Gérer
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted">
              Tout va bien : aucun article presque épuisé.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((product) => {
                const [img] = parseImages(product.images);
                return (
                  <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <span className="h-10 w-10 rounded-lg bg-paper" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-muted">{formatFCFA(product.price)}</p>
                    </div>
                    <span
                      className={`badge ${
                        product.stock === 0
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {product.stock === 0 ? "Rupture" : `${product.stock} rest.`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {plan.id === "FREE" && (
        <section className="rounded-2xl border border-accent-300 bg-accent-100/60 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-brand-900">Tu es sur le plan gratuit</p>
              <p className="mt-1 text-sm text-brand-900/75">
                {plan.maxProducts} produits maximum et badge Vitrine sur ta page. Passe en Pro pour
                retirer le badge et aller jusqu&apos;à 200 produits.
              </p>
            </div>
            <Link href="/tableau-de-bord/abonnement" className="btn btn-primary shrink-0">
              Voir les plans
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
