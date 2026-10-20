import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { requireMerchant } from "@/lib/auth";
import { maskPhone } from "@/lib/sms";

export const metadata: Metadata = { title: "Vérification du numéro — Vitrine" };

export default async function VerifierTelephonePage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const merchant = await requireMerchant("/verifier-telephone");
  if (merchant.phoneVerified) redirect("/tableau-de-bord");

  const { bienvenue } = await searchParams;

  return (
    <AuthShell
      title={bienvenue ? "Bienvenue sur Vitrine" : "Vérifiez votre numéro"}
      subtitle={
        bienvenue
          ? "Dernière étape : confirmez votre numéro de téléphone pour sécuriser votre compte."
          : "Confirmez votre numéro pour sécuriser votre compte et vos commandes."
      }
    >
      <div className="space-y-5">
        <PhoneVerification phone={merchant.phone} masked={maskPhone(merchant.phone)} />

        <div className="border-t border-line pt-4">
          <a href="/tableau-de-bord" className="text-[12px] font-medium text-muted hover:text-ink">
            Vérifier plus tard, aller au tableau de bord
          </a>
        </div>
      </div>
    </AuthShell>
  );
}
