import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/icons";
import { PLANS } from "@/lib/plans";
import { formatFCFA } from "@/lib/format";

export const metadata: Metadata = { title: "Tarifs — Vitrine" };

export default function TarifsPage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">
              Se connecter
            </Link>
            <Link href="/inscription" className="btn btn-primary btn-sm">
              Créer ma boutique
            </Link>
          </div>
        </div>
      </header>

      <section className="container-page py-16 md:py-24">
        <div className="max-w-xl">
          <p className="eyebrow">Tarifs</p>
          <h1 className="display mt-4 text-[38px] leading-[1.08] sm:text-[46px]">
            Des prix simples, en francs CFA.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Commencez gratuitement et passez à une formule payante le jour où votre boutique tourne.
            Paiement par Orange Money, MTN MoMo ou Wave, sans engagement.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {Object.values(PLANS).map((plan) => {
            const highlight = plan.id === "PRO";
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-xl border p-7 ${
                  highlight ? "border-brand-800 bg-brand-950 text-white" : "border-line bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-medium">{plan.label}</h2>
                  {highlight && (
                    <span className="rounded border border-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-200">
                      Recommandé
                    </span>
                  )}
                </div>
                <p className={`mt-1 text-[12px] ${highlight ? "text-white/50" : "text-muted"}`}>
                  {plan.tagline}
                </p>
                <p className="display mt-6 text-[34px] leading-none">
                  {plan.price === 0 ? "0 FCFA" : formatFCFA(plan.price)}
                </p>
                <p className={`mt-1 text-[12px] ${highlight ? "text-white/50" : "text-muted"}`}>
                  {plan.price === 0 ? "pour toujours" : "par mois"}
                </p>

                <ul
                  className={`mt-6 flex-1 space-y-2.5 border-t pt-5 text-[13px] ${
                    highlight ? "border-white/10" : "border-line"
                  }`}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Icon
                        name="check"
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${highlight ? "text-brand-300" : "text-brand-600"}`}
                        strokeWidth={2.2}
                      />
                      <span className={highlight ? "text-white/70" : "text-muted"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inscription"
                  className={`btn mt-7 w-full ${highlight ? "btn-accent" : "btn-outline"}`}
                >
                  Commencer
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-[12px] text-muted">
          Prix en francs CFA (XOF). Aucun frais caché, aucun engagement de durée.
        </p>
      </section>
    </main>
  );
}
