import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentMerchant } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion — Vitrine" };

export default async function ConnexionPage() {
  const merchant = await getCurrentMerchant();
  if (merchant) redirect("/tableau-de-bord");

  return (
    <AuthShell
      title="Bon retour !"
      subtitle="Connecte-toi pour gérer tes produits et tes commandes."
    >
      <LoginForm />
    </AuthShell>
  );
}
