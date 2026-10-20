import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { formatFCFA, whatsappLink } from "@/lib/format";
import { getPlan, PLANS } from "@/lib/plans";
import { updatePlan } from "@/lib/actions/store";
import { IconWhatsApp } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AbonnementPage() {
  const merchant = await requireMerchant();
  const current = getPlan(merchant.plan);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Abonnement</h1>
        <p className="mt-1 text-sm text-muted">
          Tu es sur le plan <strong>{current.label}</strong>. Change de plan quand tu veux.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = plan.id === current.id;
          const highlight = plan.id === "PRO";
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-5 ${
                isCurrent
                  ? "border-brand-600 ring-2 ring-brand-200"
                  : highlight
                    ? "border-brand-300"
                    : "border-line"
              } bg-white`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-5 rounded-full bg-brand-700 px-2.5 py-1 text-[10px] font-bold text-white">
                  Plan actuel
                </span>
              )}
              <h2 className="font-bold">{plan.label}</h2>
              <p className="text-xs text-muted">{plan.tagline}</p>
              <p className="mt-3 text-2xl font-extrabold">
                {plan.price === 0 ? "0 FCFA" : formatFCFA(plan.price)}
                <span className="text-xs font-medium text-muted">
                  {plan.price === 0 ? "/ toujours" : "/ mois"}
                </span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-brand-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <form action={updatePlan} className="mt-5">
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className={`btn w-full ${isCurrent ? "btn-outline" : highlight ? "btn-primary" : "btn-outline"}`}
                >
                  {isCurrent ? "Plan actuel" : plan.price === 0 ? "Revenir au gratuit" : `Passer en ${plan.label}`}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-300 bg-accent-100/60 p-5">
        <h2 className="font-bold text-brand-900">Paiement par Mobile Money</h2>
        <p className="mt-1 text-sm text-brand-900/80">
          Orange Money, MTN MoMo ou Wave. En attendant le paiement automatique, écris-nous sur
          WhatsApp : on active ton plan le jour même.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={whatsappLink(
              "0700000000",
              `Bonjour, je souhaite activer le plan ${current.label === "Gratuit" ? "Pro" : "Business"} pour ma boutique ${merchant.storeName}.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="btn btn-wa"
          >
            <IconWhatsApp className="h-4 w-4" />
            Activer par WhatsApp
          </a>
          <Link href="/tableau-de-bord" className="btn btn-outline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
