import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentMerchant } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion — Vitrine" };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reinitialise?: string }>;
}) {
  const merchant = await getCurrentMerchant();
  if (merchant) redirect("/tableau-de-bord");

  const { next, reinitialise } = await searchParams;

  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous pour gérer vos produits et vos commandes."
    >
      <LoginForm
        next={next}
        notice={
          reinitialise
            ? "Mot de passe réinitialisé. Connectez-vous avec votre nouveau mot de passe."
            : undefined
        }
      />
    </AuthShell>
  );
}
