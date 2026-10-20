import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatFCFA } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import { parseImages } from "@/lib/types";
import { deleteProduct, toggleProduct } from "@/lib/actions/products";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Icon } from "@/components/icons";

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
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="display text-[30px] leading-tight">Produits</h1>
          <p className="mt-1 text-[13px] text-muted">
            {products.length} sur {plan.maxProducts === Number.POSITIVE_INFINITY ? "∞" : plan.maxProducts}{" "}
            · formule {plan.label}
          </p>
        </div>
        <Link href="/tableau-de-bord/produits/nouveau" className="btn btn-primary btn-sm shrink-0">
          <Icon name="plus" className="h-4 w-4" />
          Nouveau produit
        </Link>
      </div>

      {(cree || maj) && (
        <div className="flex items-center gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-[13px] font-medium text-brand-900">
          <Icon name="check" className="h-4 w-4 text-brand-700" strokeWidth={2.2} />
          {cree ? "Article publié dans votre vitrine." : "Article mis à jour."}
        </div>
      )}

      {products.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <Icon name="box" className="mx-auto h-7 w-7 text-line-strong" />
          <h2 className="mt-4 text-[15px] font-medium">Votre vitrine est vide</h2>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[13px] leading-relaxed text-muted">
            Ajoutez un premier article : une photo, un prix, un stock. Cela prend une trentaine de
            secondes.
          </p>
          <Link href="/tableau-de-bord/produits/nouveau" className="btn btn-primary btn-sm mt-5">
            <Icon name="plus" className="h-4 w-4" />
            Ajouter un article
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const [img] = parseImages(product.images);
            return (
              <article key={product.id} className="card overflow-hidden">
                <div className="relative aspect-[4/3] border-b border-line bg-paper">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon name="image" className="h-6 w-6 text-line-strong" />
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                    <span
                      className={`badge bg-white ${
                        product.stock === 0
                          ? "border-danger/25 text-danger"
                          : product.stock <= 2
                            ? "border-accent-400/50 text-accent-600"
                            : "text-brand-700"
                      }`}
                    >
                      {product.stock === 0 ? "Rupture" : `Stock ${product.stock}`}
                    </span>
                    {!product.active && <span className="badge bg-white text-muted">Masqué</span>}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
                    {product.category || "Sans catégorie"}
                  </p>
                  <h2 className="mt-1 truncate text-[14px] font-medium">{product.name}</h2>
                  <p className="mt-1 text-[13px]">
                    <span className="font-medium">{formatFCFA(product.price)}</span>
                    {product.compareAtPrice && (
                      <span className="ml-2 text-[11px] text-muted line-through">
                        {formatFCFA(product.compareAtPrice)}
                      </span>
                    )}
                  </p>

                  <div className="mt-3.5 flex items-center gap-1.5 border-t border-line pt-3">
                    <Link
                      href={`/tableau-de-bord/produits/${product.id}`}
                      className="btn btn-ghost btn-sm px-2"
                    >
                      <Icon name="edit" className="h-3.5 w-3.5" />
                      Modifier
                    </Link>
                    <form action={toggleProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="btn btn-ghost btn-sm px-2">
                        <Icon name={product.active ? "eye" : "eye"} className="h-3.5 w-3.5" />
                        {product.active ? "Masquer" : "Afficher"}
                      </button>
                    </form>
                    <form action={deleteProduct} className="ml-auto">
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmButton
                        message={`Supprimer « ${product.name} » ? Cette action est définitive.`}
                        className="btn btn-ghost btn-sm px-2 text-muted hover:text-danger"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
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
