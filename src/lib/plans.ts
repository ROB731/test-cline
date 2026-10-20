export const PLANS = {
  FREE: {
    id: "FREE",
    label: "Gratuit",
    price: 0,
    tagline: "Pour démarrer et tester",
    maxProducts: 15,
    showBadge: true,
    stats: false,
    features: [
      "15 produits maximum",
      "Vitrine publique + lien à partager",
      "Commandes WhatsApp illimitées",
      "Gestion du stock",
      "Badge « Propulsé par Vitrine »",
    ],
  },
  PRO: {
    id: "PRO",
    label: "Essentiel",
    price: 1500,
    tagline: "Pour vendre sérieusement",
    maxProducts: 100,
    showBadge: false,
    stats: false,
    features: [
      "100 produits",
      "Sans mention Vitrine",
      "Commandes et stock illimités",
      "Contact direct WhatsApp et appel",
      "Support par WhatsApp",
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    label: "Pro",
    price: 3000,
    tagline: "Pour les boutiques qui grandissent",
    maxProducts: Number.POSITIVE_INFINITY,
    showBadge: false,
    stats: true,
    features: [
      "Produits illimités",
      "Sans mention Vitrine",
      "Statistiques détaillées",
      "Export des commandes",
      "Accompagnement personnalisé",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(plan: string | null | undefined) {
  if (plan === "PRO" || plan === "BUSINESS") return PLANS[plan];
  return PLANS.FREE;
}

export function planLimitReached(plan: string | null | undefined, productCount: number) {
  return productCount >= getPlan(plan).maxProducts;
}
