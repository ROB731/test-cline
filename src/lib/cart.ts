"use client";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
};

const EVENT = "vitrine-cart-change";

function key(slug: string) {
  return `vitrine_cart_${slug}`;
}

export function readCart(slug: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(slug));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        Boolean(item) && typeof item.productId === "string" && typeof item.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function writeCart(slug: string, items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(slug), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug } }));
}

export function addToCart(slug: string, item: CartItem) {
  const items = readCart(slug);
  const existing = items.find((entry) => entry.productId === item.productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, item.stock);
    existing.price = item.price;
    existing.stock = item.stock;
  } else {
    items.push({ ...item, quantity: Math.min(item.quantity, item.stock) });
  }
  writeCart(slug, items);
}

export function setQuantity(slug: string, productId: string, quantity: number) {
  const items = readCart(slug).map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.max(0, Math.min(quantity, item.stock)) }
      : item,
  );
  writeCart(slug, items.filter((item) => item.quantity > 0));
}

export function clearCart(slug: string) {
  writeCart(slug, []);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function subscribeToCart(slug: string, callback: () => void) {
  if (typeof window === "undefined") return;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ slug: string }>).detail;
    if (!detail || detail.slug === slug) callback();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", callback);
  };
}
