import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { ProductForm } from "@/components/ProductForm";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NouveauProduitPage() {
  const merchant = await requireMerchant();
  const plan = getPlan(merchant.plan);
  const count = await prisma.product.count({ where: { merchantId: merchant.id } });

  if (count >= plan.maxProducts) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <Icon name="alert" className="mx-auto h-7 w-7 text-accent-500" />
        <h1 className="display mt-4 text-[26px] leading-tight">Limite de produits atteinte</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          La formule {plan.label} autorise {plan.maxProducts} produits. Passez à la formule
          supérieure pour continuer à publier.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/tableau-de-bord/abonnement" className="btn btn-primary btn-sm">
            Voir les formules
          </Link>
          <Link href="/tableau-de-bord/produits" className="btn btn-outline btn-sm">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/tableau-de-bord/produits"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" />
          Produits
        </Link>
        <h1 className="display mt-2 text-[30px] leading-tight">Ajouter un produit</h1>
        <p className="mt-1 text-[13px] text-muted">
          Une photo nette, un prix juste : l&apos;article apparaît immédiatement dans votre vitrine.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
