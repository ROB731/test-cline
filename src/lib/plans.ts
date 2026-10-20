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
    label: "Pro",
    price: 5000,
    tagline: "Pour les vendeurs réguliers",
    maxProducts: 200,
    showBadge: false,
    stats: true,
    features: [
      "200 produits",
      "Sans badge Vitrine",
      "Statistiques de la boutique",
      "Commandes et stock illimités",
      "Support WhatsApp prioritaire",
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    label: "Business",
    price: 15000,
    tagline: "Pour les boutiques qui grossissent",
    maxProducts: Number.POSITIVE_INFINITY,
    showBadge: false,
    stats: true,
    features: [
      "Produits illimités",
      "Sans badge Vitrine",
      "Plusieurs vendeurs (bientôt)",
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
