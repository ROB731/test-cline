"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addToCart,
  cartCount,
  cartTotal,
  clearCart,
  readCart,
  setQuantity,
  subscribeToCart,
  type CartItem,
} from "@/lib/cart";
import { formatFCFA } from "@/lib/format";
import { CartSheet } from "@/components/store/CartSheet";
import { Icon } from "@/components/icons";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  category: string | null;
  stock: number;
};

export function StoreCatalog({
  slug,
  storeName,
  whatsapp,
  products,
  openCartInitially = false,
}: {
  slug: string;
  storeName: string;
  whatsapp: string;
  products: CatalogProduct[];
  openCartInitially?: boolean;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(openCartInitially);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(readCart(slug));
    return subscribeToCart(slug, () => setItems(readCart(slug)));
  }, [slug]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(timer);
  }, [toast]);

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category).filter(Boolean) as string[]);
    return ["Tous", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = category === "Tous" || product.category === category;
      const matchQuery =
        !search ||
        product.name.toLowerCase().includes(search) ||
        (product.category ?? "").toLowerCase().includes(search);
      return matchCategory && matchQuery;
    });
  }, [products, query, category]);

  const count = cartCount(items);
  const total = cartTotal(items);

  function handleAdd(product: CatalogProduct) {
    if (product.stock <= 0) return;
    addToCart(slug, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: 1,
    });
    setToast(`${product.name} ajouté au panier`);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un article"
              className="input pl-9 text-[13px]"
              aria-label="Rechercher un article"
            />
          </div>
          <p className="text-[12px] text-muted">
            {filtered.length} article{filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-5 overflow-x-auto border-b border-line">
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setCategory(entry)}
                className={`-mb-px shrink-0 border-b-2 pb-2.5 text-[12px] transition ${
                  category === entry
                    ? "border-brand-800 font-medium text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {entry}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
            <Icon name="grid" className="mx-auto h-6 w-6 text-line-strong" />
            <p className="mt-3 text-[13px] font-medium">
              {products.length === 0 ? "Les premiers articles arrivent bientôt" : "Aucun résultat"}
            </p>
            <p className="mt-1 text-[12px] text-muted">
              {products.length === 0
                ? "La boutique prépare son catalogue. Revenez dans quelques jours."
                : "Essayez un autre mot ou une autre catégorie."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <article key={product.id} className="group">
                <Link
                  href={`/s/${slug}/p/${product.id}`}
                  className="relative block aspect-square overflow-hidden rounded-lg border border-line bg-paper"
                >
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon name="image" className="h-6 w-6 text-line-strong" />
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                      Épuisé
                    </span>
                  )}
                </Link>

                <div className="mt-2.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/s/${slug}/p/${product.id}`}>
                      <h3 className="line-clamp-2 text-[13px] font-medium leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-[13px]">
                      <span className="font-medium">{formatFCFA(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="ml-1.5 text-[11px] text-muted line-through">
                          {formatFCFA(product.compareAtPrice)}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    disabled={product.stock <= 0}
                    aria-label={`Ajouter ${product.name} au panier`}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line-strong text-ink transition hover:border-brand-700 hover:bg-brand-50 hover:text-brand-800 disabled:border-line disabled:text-line-strong"
                  >
                    <Icon name="plus" className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-md bg-ink px-3.5 py-2 text-[12px] font-medium text-white shadow-lg">
          <Icon name="check" className="h-3.5 w-3.5 text-brand-300" strokeWidth={2.4} />
          {toast}
        </div>
      )}

      {count > 0 && !sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
          <div className="container-page flex items-center gap-4">
            <p className="text-[12px] text-muted">
              {count} article{count > 1 ? "s" : ""}
            </p>
            <p className="ml-auto text-[14px] font-medium">{formatFCFA(total)}</p>
            <button type="button" onClick={() => setSheetOpen(true)} className="btn btn-primary btn-sm">
              Voir mon panier
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <CartSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        slug={slug}
        storeName={storeName}
        whatsapp={whatsapp}
        items={items}
        onQuantity={(productId, quantity) => setQuantity(slug, productId, quantity)}
        onClear={() => clearCart(slug)}
      />
    </>
  );
}
