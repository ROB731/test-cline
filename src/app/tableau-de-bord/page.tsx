import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatFCFA, statusMeta } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { parseImages, parseItems } from "@/lib/types";
import { StoreLink } from "@/components/StoreLink";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; verifie?: string }>;
}) {
  const merchant = await requireMerchant();
  const { bienvenue, verifie } = await searchParams;
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
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="display text-[30px] leading-tight">Bonjour {firstName}</h1>
          <p className="mt-1 text-[13px] text-muted">
            {productCount === 0
              ? "Votre vitrine est prête. Ajoutez un premier article pour commencer."
              : `${productCount} article${productCount > 1 ? "s" : ""} en ligne sur votre vitrine.`}
          </p>
        </div>
        <Link href="/tableau-de-bord/produits/nouveau" className="btn btn-primary btn-sm shrink-0">
          <Icon name="plus" className="h-4 w-4" />
          Ajouter un produit
        </Link>
      </div>

      {verifie && (
        <div className="flex gap-3 rounded-lg border border-success/25 bg-success/[0.07] px-4 py-3.5">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div>
            <p className="text-[13px] font-medium text-success">Numéro vérifié</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-success/80">
              Votre compte est sécurisé. Vous pouvez recevoir les codes de récupération par SMS.
            </p>
          </div>
        </div>
      )}

      {!merchant.phoneVerified && !verifie && (
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-accent-400/50 bg-accent-100/60 px-4 py-3.5 sm:flex-row sm:items-center">
          <div className="flex gap-3">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
            <div>
              <p className="text-[13px] font-medium text-ink">Vérifiez votre numéro de téléphone</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink/70">
                Indispensable pour récupérer votre compte en cas de mot de passe oublié.
              </p>
            </div>
          </div>
          <Link href="/verifier-telephone" className="btn btn-outline btn-sm shrink-0">
            Vérifier maintenant
          </Link>
        </div>
      )}

      {bienvenue && (
        <div className="flex gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
          <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.2} />
          <div>
            <p className="text-[13px] font-medium text-brand-900">Votre vitrine est active</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-brand-900/70">
              Ajoutez vos produits, puis partagez le lien dans votre biographie Instagram et vos
              statuts. Les commandes arriveront ici, déjà rédigées.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {[
          { label: "Chiffre d'affaires", value: formatFCFA(revenue._sum.total ?? 0), hint: `${delivered} commande(s) livrée(s)` },
          { label: "Nouvelles commandes", value: `${newOrders}`, hint: "à traiter" },
          {
            label: "Produits",
            value: `${productCount}/${plan.maxProducts === Number.POSITIVE_INFINITY ? "∞" : plan.maxProducts}`,
            hint: `formule ${plan.label}`,
          },
          { label: "Stock faible", value: `${lowStock.length}`, hint: "articles à réapprovisionner" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
              {stat.label}
            </p>
            <p className="display mt-2 text-[24px] leading-none">{stat.value}</p>
            <p className="mt-1.5 text-[11px] text-muted">{stat.hint}</p>
          </div>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="text-[14px] font-medium">Lien de la boutique</h2>
        <p className="mt-1 text-[13px] text-muted">
          À placer dans votre biographie Instagram, vos statuts WhatsApp et votre page Facebook.
        </p>
        <div className="mt-3">
          <StoreLink slug={merchant.slug} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-[14px] font-medium">Dernières commandes</h2>
            <Link href="/tableau-de-bord/commandes" className="text-[12px] font-medium text-brand-700 hover:underline">
              Tout voir
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Icon name="bag" className="mx-auto h-6 w-6 text-line-strong" />
              <p className="mt-3 text-[13px] font-medium">Aucune commande pour le moment</p>
              <p className="mx-auto mt-1 max-w-[260px] text-[12px] leading-relaxed text-muted">
                Partagez votre lien : la première vente arrive souvent le jour même.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((order) => {
                const items = parseItems(order.items);
                const meta = statusMeta(order.status);
                return (
                  <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{order.customerName}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                        {order.reference} · {items.reduce((n, i) => n + i.quantity, 0)} article(s) ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-medium">{formatFCFA(order.total)}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{meta.label}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-[14px] font-medium">Stock à surveiller</h2>
            <Link href="/tableau-de-bord/produits" className="text-[12px] font-medium text-brand-700 hover:underline">
              Gérer
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-[13px] text-muted">
              Aucun article presque épuisé pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((product) => {
                const [img] = parseImages(product.images);
                return (
                  <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-9 w-9 rounded border border-line object-cover" />
                    ) : (
                      <span className="h-9 w-9 rounded bg-paper" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{product.name}</p>
                      <p className="text-[11px] text-muted">{formatFCFA(product.price)}</p>
                    </div>
                    <span
                      className={`badge ${product.stock === 0 ? "border-danger/25 bg-danger/[0.06] text-danger" : "border-accent-400/40 bg-accent-100 text-accent-600"}`}
                    >
                      {product.stock === 0 ? "Rupture" : `${product.stock} restant`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {plan.id === "FREE" && (
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-center">
          <div className="flex gap-3">
            <Icon name="sliders" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-[13px] font-medium">Formule gratuite</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                {plan.maxProducts} produits maximum et mention Vitrine en bas de page. La formule
                Essentiel retire la mention et autorise 100 produits.
              </p>
            </div>
          </div>
          <Link href="/tableau-de-bord/abonnement" className="btn btn-outline btn-sm shrink-0">
            Comparer les formules
          </Link>
        </section>
      )}
    </div>
  );
}
