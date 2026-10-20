"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatFCFA } from "@/lib/format";

export function ProductActions({
  slug,
  product,
}: {
  slug: string;
  product: { id: string; name: string; price: number; image: string | null; stock: number };
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;

  function add(goToCart: boolean) {
    if (soldOut) return;
    addToCart(slug, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity,
    });
    if (goToCart) {
      router.push(`/s/${slug}?panier=1`);
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-white">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="px-3.5 py-2 text-lg leading-none text-muted"
            aria-label="Diminuer la quantité"
          >
            −
          </button>
          <span className="min-w-6 text-center text-sm font-bold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
            disabled={quantity >= product.stock}
            className="px-3.5 py-2 text-lg leading-none text-muted disabled:opacity-30"
            aria-label="Augmenter la quantité"
          >
            +
          </button>
        </div>
        <p className="text-sm text-muted">
          Total : <strong className="text-ink">{formatFCFA(product.price * quantity)}</strong>
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => add(true)}
          disabled={soldOut}
          className="btn btn-primary w-full"
        >
          {soldOut ? "Article épuisé" : "Commander maintenant"}
        </button>
        <button
          type="button"
          onClick={() => add(false)}
          disabled={soldOut}
          className="btn btn-outline w-full"
        >
          {added ? "Ajouté ✓" : "Ajouter au panier"}
        </button>
      </div>

      {added && (
        <button
          type="button"
          onClick={() => router.push(`/s/${slug}?panier=1`)}
          className="w-full text-center text-xs font-semibold text-brand-700 hover:underline"
        >
          Voir ma commande →
        </button>
      )}
    </div>
  );
}
