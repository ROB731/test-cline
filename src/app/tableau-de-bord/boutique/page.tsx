import { requireMerchant } from "@/lib/auth";
import { StoreSettingsForm } from "@/components/StoreSettingsForm";
import { StoreLink } from "@/components/StoreLink";

export const dynamic = "force-dynamic";

export default async function BoutiquePage() {
  const merchant = await requireMerchant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ma boutique</h1>
        <p className="mt-1 text-sm text-muted">
          Ces informations apparaissent sur ta vitrine publique.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-bold">Partager ma boutique</h2>
        <p className="mt-1 text-sm text-muted">
          Un seul lien pour Instagram, WhatsApp, Facebook et tes cartes de visite.
        </p>
        <div className="mt-3">
          <StoreLink slug={merchant.slug} />
        </div>
      </div>

      <StoreSettingsForm
        merchant={{
          storeName: merchant.storeName,
          slug: merchant.slug,
          city: merchant.city,
          bio: merchant.bio,
          whatsapp: merchant.whatsapp,
          callNumber: merchant.callNumber,
          logoUrl: merchant.logoUrl,
        }}
      />

      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-bold">Où mettre ton lien ?</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>• Bio Instagram et lien de la page Facebook</li>
          <li>• Statut WhatsApp (ajoute-le en texte dans ton statut du jour)</li>
          <li>• Signature de tes messages WhatsApp Business</li>
          <li>• QR code imprimé sur ton étal ou ta carte de visite</li>
        </ul>
      </div>
    </div>
  );
}
