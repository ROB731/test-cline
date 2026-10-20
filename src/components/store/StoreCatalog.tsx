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
    const timer = setTimeout(() => setToast(null), 1800);
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
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un article…"
              className="input pl-9 text-sm"
              aria-label="Rechercher un article"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              🔍
            </span>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setCategory(entry)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  category === entry
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-line bg-white text-muted"
                }`}
              >
                {entry}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white px-4 py-12 text-center text-sm text-muted">
            {products.length === 0
              ? "La boutique prépare ses premiers articles. Reviens très vite !"
              : "Aucun article ne correspond à ta recherche."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-2xl border border-line bg-white">
                <Link href={`/s/${slug}/p/${product.id}`} className="relative block aspect-square bg-paper">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🖼️</div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold text-white">
                        Épuisé
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-2.5">
                  <Link href={`/s/${slug}/p/${product.id}`}>
                    <h3 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-1.5 flex items-end justify-between gap-1">
                    <div>
                      <p className="text-sm font-extrabold text-brand-800">{formatFCFA(product.price)}</p>
                      {product.compareAtPrice && (
                        <p className="text-[10px] text-muted line-through">
                          {formatFCFA(product.compareAtPrice)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      disabled={product.stock <= 0}
                      aria-label={`Ajouter ${product.name} au panier`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-lg leading-none text-white transition hover:bg-brand-800 disabled:bg-line"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast} ✓
        </div>
      )}

      {count > 0 && !sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="btn btn-primary w-full justify-between"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
              {count}
            </span>
            <span>Voir ma commande</span>
            <span className="font-bold">{formatFCFA(total)}</span>
          </button>
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
