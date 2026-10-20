import { requireMerchant } from "@/lib/auth";
import { StoreSettingsForm } from "@/components/StoreSettingsForm";
import { StoreLink } from "@/components/StoreLink";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

const tips = [
  "Biographie Instagram et lien de la page Facebook",
  "Statut WhatsApp, en texte dans le statut du jour",
  "Signature de vos messages WhatsApp Business",
  "QR code imprimé sur votre étal ou votre carte de visite",
];

export default async function BoutiquePage() {
  const merchant = await requireMerchant();

  return (
    <div className="space-y-7">
      <div>
        <h1 className="display text-[30px] leading-tight">Boutique</h1>
        <p className="mt-1 text-[13px] text-muted">
          Ces informations apparaissent sur votre vitrine publique.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="text-[14px] font-medium">Partager la boutique</h2>
        <p className="mt-1 text-[13px] text-muted">
          Une seule adresse pour Instagram, WhatsApp, Facebook et vos cartes de visite.
        </p>
        <div className="mt-3">
          <StoreLink slug={merchant.slug} />
        </div>
      </section>

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

      <section className="rounded-xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-medium">Où placer votre lien</h2>
        <ul className="mt-3 space-y-2">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-[13px] text-muted">
              <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2.2} />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
