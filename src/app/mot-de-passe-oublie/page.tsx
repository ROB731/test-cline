import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getCurrentMerchant } from "@/lib/auth";

export const metadata: Metadata = { title: "Mot de passe oublié — Vitrine" };

export default async function MotDePasseOubliePage() {
  const merchant = await getCurrentMerchant();
  if (merchant) redirect("/tableau-de-bord/compte");

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un code par SMS, puis choisissez un nouveau mot de passe."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
