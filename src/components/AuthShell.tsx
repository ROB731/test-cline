import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1fr_1.05fr]">
      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:py-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer}
        </div>
        <p className="text-center text-xs text-muted">
          <Link href="/" className="hover:text-ink">← Retour à l&apos;accueil</Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-700/60 blur-3xl"
        />
        <div className="relative max-w-md">
          <span className="badge border-white/20 bg-white/10 text-white">🇨🇮 Côte d&apos;Ivoire</span>
          <h2 className="mt-6 text-4xl font-extrabold leading-tight">
            Un lien. Tous tes produits. Tes commandes au propre.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-white/80">
            {[
              "Une vitrine à ton nom, prête en 5 minutes",
              "Un panier qui envoie une commande claire sur WhatsApp",
              "Le stock qui se met à jour tout seul",
              "Gratuit pour commencer, 5 000 FCFA/mois pour passer Pro",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-accent-300">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
            <p className="font-semibold text-white">Compte de démonstration</p>
            <p className="mt-1 text-white/70">
              Téléphone <span className="font-mono">0700000000</span> · mot de passe{" "}
              <span className="font-mono">demo1234</span>
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
