"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatFCFA } from "@/lib/format";
import { Icon } from "@/components/icons";

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
        <div className="inline-flex items-center rounded-[var(--shop-radius)] border border-[var(--shop-line)] bg-[var(--shop-surface)]">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="px-3 py-2 text-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
            aria-label="Diminuer la quantité"
          >
            <Icon name="minus" className="h-4 w-4" />
          </button>
          <span className="min-w-6 text-center text-sm font-bold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
            disabled={quantity >= product.stock}
            className="px-3 py-2 text-[var(--shop-muted)] hover:text-[var(--shop-ink)] disabled:opacity-30"
            aria-label="Augmenter la quantité"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-[var(--shop-muted)]">
          Total : <strong className="text-[var(--shop-ink)]">{formatFCFA(product.price * quantity)}</strong>
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => add(true)}
          disabled={soldOut}
          className="shop-btn w-full"
        >
          {soldOut ? "Article épuisé" : "Commander maintenant"}
        </button>
        <button
          type="button"
          onClick={() => add(false)}
          disabled={soldOut}
          className="shop-btn-outline w-full"
        >
          {added ? (
            <>
              <Icon name="check" className="h-4 w-4" strokeWidth={2.2} />
              Ajouté au panier
            </>
          ) : (
            "Ajouter au panier"
          )}
        </button>
      </div>

      {added && (
        <button
          type="button"
          onClick={() => router.push(`/s/${slug}?panier=1`)}
          className="w-full text-center text-xs font-medium text-[var(--shop-accent)] hover:underline"
        >
          Voir ma commande →
        </button>
      )}
    </div>
  );
}
