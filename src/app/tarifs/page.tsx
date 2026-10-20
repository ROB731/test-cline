import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PLANS } from "@/lib/plans";
import { formatFCFA } from "@/lib/format";

export const metadata: Metadata = { title: "Tarifs — Vitrine" };

export default function TarifsPage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/connexion" className="btn btn-outline hidden sm:inline-flex">
              Connexion
            </Link>
            <Link href="/inscription" className="btn btn-primary">
              Créer ma boutique
            </Link>
          </div>
        </div>
      </header>

      <section className="container-page py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge border-brand-200 bg-brand-50 text-brand-800">Sans engagement</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Des prix simples, en FCFA
          </h1>
          <p className="mt-3 text-muted">
            Commence gratuitement. Passe au plan payant le jour où ta boutique tourne. Paiement par
            Orange Money, MTN MoMo ou Wave.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {Object.values(PLANS).map((plan) => {
            const highlight = plan.id === "PRO";
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 ${
                  highlight ? "border-brand-600 bg-brand-900 text-white shadow-xl" : "border-line bg-white"
                }`}
              >
                {highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-brand-900">
                    Le plus choisi
                  </span>
                )}
                <h2 className="text-lg font-bold">{plan.label}</h2>
                <p className={`text-sm ${highlight ? "text-white/70" : "text-muted"}`}>{plan.tagline}</p>
                <p className="mt-4 text-3xl font-extrabold">
                  {plan.price === 0 ? "0 FCFA" : formatFCFA(plan.price)}
                  <span className={`text-sm font-medium ${highlight ? "text-white/60" : "text-muted"}`}>
                    {plan.price === 0 ? " / toujours" : " / mois"}
                  </span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className={highlight ? "text-accent-300" : "text-brand-600"}>✓</span>
                      <span className={highlight ? "text-white/85" : "text-muted"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/inscription"
                  className={`btn mt-6 w-full ${highlight ? "btn-accent" : "btn-outline"}`}
                >
                  Commencer
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Les prix sont en francs CFA (XOF). Aucun frais caché, aucun engagement de durée.
        </p>
      </section>
    </main>
  );
}
