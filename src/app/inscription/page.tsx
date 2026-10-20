import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { SignUpForm } from "@/components/AuthForms";
import { getCurrentMerchant } from "@/lib/auth";

export const metadata: Metadata = { title: "Créer ma boutique — Vitrine" };

export default async function InscriptionPage() {
  const merchant = await getCurrentMerchant();
  if (merchant) redirect("/tableau-de-bord");

  return (
    <AuthShell
      title="Crée ta vitrine"
      subtitle="5 minutes, aucun paiement, et ton lien est prêt à partager."
    >
      <SignUpForm />
    </AuthShell>
  );
}
