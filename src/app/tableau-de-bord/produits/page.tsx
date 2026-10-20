import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatFCFA } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { parseImages } from "@/lib/types";
import { deleteProduct, toggleProduct } from "@/lib/actions/products";
import { ConfirmButton } from "@/components/ConfirmButton";
import { IconPlus } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ cree?: string; maj?: string }>;
}) {
  const merchant = await requireMerchant();
  const { cree, maj } = await searchParams;
  const plan = getPlan(merchant.plan);

  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mes produits</h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} / {plan.maxProducts === Number.POSITIVE_INFINITY ? "∞" : plan.maxProducts} produits · plan {plan.label}
          </p>
        </div>
        <Link href="/tableau-de-bord/produits/nouveau" className="btn btn-primary shrink-0">
          <IconPlus className="h-4 w-4" />
          Nouveau produit
        </Link>
      </div>

      {(cree || maj) && (
        <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-900">
          {cree ? "Produit publié dans ta vitrine ✅" : "Produit mis à jour ✅"}
        </p>
      )}

      {products.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-4xl">📦</p>
          <h2 className="mt-3 text-lg font-bold">Ta vitrine est encore vide</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Ajoute ton premier article : une photo, un prix, un stock. Ça prend 30 secondes.
          </p>
          <Link href="/tableau-de-bord/produits/nouveau" className="btn btn-primary mt-5">
            <IconPlus className="h-4 w-4" />
            Ajouter mon premier produit
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const [img] = parseImages(product.images);
            const stockTone =
              product.stock === 0
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : product.stock <= 2
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800";

            return (
              <article key={product.id} className={`card overflow-hidden ${product.active ? "" : "opacity-70"}`}>
                <div className="relative aspect-[4/3] bg-paper">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🖼️</div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    <span className={`badge bg-white ${stockTone}`}>
                      {product.stock === 0 ? "Rupture" : `Stock ${product.stock}`}
                    </span>
                    {!product.active && (
                      <span className="badge border-line bg-white text-muted">Masqué</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {product.category || "Sans catégorie"}
                    </p>
                    <h2 className="mt-0.5 line-clamp-1 font-bold">{product.name}</h2>
                    <p className="mt-1 text-sm">
                      <span className="font-bold text-brand-800">{formatFCFA(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="ml-2 text-xs text-muted line-through">
                          {formatFCFA(product.compareAtPrice)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/tableau-de-bord/produits/${product.id}`}
                      className="btn btn-outline px-3 py-1.5 text-xs"
                    >
                      Modifier
                    </Link>

                    <form action={toggleProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="btn btn-outline px-3 py-1.5 text-xs">
                        {product.active ? "Masquer" : "Afficher"}
                      </button>
                    </form>

                    <form action={deleteProduct} className="ml-auto">
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmButton
                        message={`Supprimer « ${product.name} » ? Cette action est définitive.`}
                        className="btn px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Supprimer
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
