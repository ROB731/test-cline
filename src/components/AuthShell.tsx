import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/icons";

const highlights = [
  { icon: "store" as const, text: "Une boutique à votre nom, prête en cinq minutes" },
  { icon: "bag" as const, text: "Un panier qui envoie une commande structurée sur WhatsApp" },
  { icon: "box" as const, text: "Un stock qui se met à jour à chaque vente" },
  { icon: "card" as const, text: "Gratuit pour commencer, 5 000 FCFA par mois pour le plan Pro" },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1fr_1fr]">
      <div className="flex min-h-dvh flex-col bg-white px-5 py-6 sm:px-10 lg:py-9">
        <Logo />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="display text-[34px] leading-[1.1]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-xs text-muted">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-ink">
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-brand-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
            Côte d&apos;Ivoire
          </p>
          <h2 className="display mt-5 max-w-[420px] text-[38px] leading-[1.12]">
            Votre catalogue mérite mieux qu&apos;un statut WhatsApp.
          </h2>
          <ul className="mt-10 max-w-[400px] space-y-4 border-t border-white/10 pt-8">
            {highlights.map((item) => (
              <li key={item.text} className="flex gap-3 text-sm leading-relaxed text-white/70">
                <Icon name={item.icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-300">
            Compte de démonstration
          </p>
          <dl className="mt-3 space-y-1.5 text-sm text-white/60">
            <div className="flex justify-between gap-4">
              <dt>Téléphone</dt>
              <dd className="font-mono text-white/90">0700000000</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Mot de passe</dt>
              <dd className="font-mono text-white/90">demo1234</dd>
            </div>
          </dl>
        </div>
      </aside>
    </main>
  );
}
