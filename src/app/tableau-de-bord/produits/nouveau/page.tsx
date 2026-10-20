import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NouveauProduitPage() {
  const merchant = await requireMerchant();
  const plan = getPlan(merchant.plan);
  const count = await prisma.product.count({ where: { merchantId: merchant.id } });

  if (count >= plan.maxProducts) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-4xl">📦</p>
        <h1 className="mt-3 text-2xl font-extrabold">Limite de produits atteinte</h1>
        <p className="mt-2 text-sm text-muted">
          Ton plan {plan.label} autorise {plan.maxProducts} produits. Passe au plan supérieur pour
          continuer à ajouter des articles.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/tableau-de-bord/abonnement" className="btn btn-primary">
            Voir les plans
          </Link>
          <Link href="/tableau-de-bord/produits" className="btn btn-outline">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tableau-de-bord/produits" className="text-sm font-semibold text-muted hover:text-ink">
          ← Mes produits
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Ajouter un produit</h1>
        <p className="mt-1 text-sm text-muted">
          Une photo nette, un prix juste, et ton article apparaît immédiatement dans ta vitrine.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
