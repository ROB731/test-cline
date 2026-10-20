export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  category: string | null;
  stock: number;
  active: boolean;
};

export function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

export function parseItems(raw: string | null | undefined): OrderItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OrderItem[]) : [];
  } catch {
    return [];
  }
}

export function newOrderReference(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}`.slice(2) + `${now.getMonth() + 1}`.padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CMD-${stamp}-${rand}`;
}
