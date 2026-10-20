/** Utilitaires d'affichage et de liens — marché ivoirien (FCFA, +225). */

export function formatFCFA(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Garde uniquement les chiffres et retire les préfixes internationaux superflus. */
export function normalizePhone(input: string): string {
  let digits = (input || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

/** Convertit un numéro local ivoirien (10 chiffres) en format international. */
export function toInternationalPhone(input: string): string {
  const digits = normalizePhone(input);
  if (digits.length === 10) return `225${digits}`;
  return digits;
}

/** Lien click-to-chat (aucune API Meta nécessaire). */
export function whatsappLink(phone: string, message?: string): string {
  const number = toInternationalPhone(phone);
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(phone: string): string {
  return `tel:+${toInternationalPhone(phone)}`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export const ORDER_STATUSES = [
  { id: "NOUVELLE", label: "Nouvelle", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: "CONFIRMEE", label: "Confirmée", tone: "bg-sky-100 text-sky-900 border-sky-200" },
  { id: "EXPEDIEE", label: "Expédiée", tone: "bg-violet-100 text-violet-900 border-violet-200" },
  { id: "LIVREE", label: "Livrée", tone: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { id: "ANNULEE", label: "Annulée", tone: "bg-rose-100 text-rose-900 border-rose-200" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["id"];

export function statusMeta(status: string) {
  return ORDER_STATUSES.find((s) => s.id === status) ?? ORDER_STATUSES[0];
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.some((s) => s.id === value);
}
