import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { formatFCFA, whatsappLink } from "@/lib/format";
import { getPlan, PLANS } from "@/lib/plans";
import { updatePlan } from "@/lib/actions/store";
import { Icon, IconWhatsApp } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AbonnementPage() {
  const merchant = await requireMerchant();
  const current = getPlan(merchant.plan);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="display text-[30px] leading-tight">Abonnement</h1>
        <p className="mt-1 text-[13px] text-muted">
          Formule actuelle : <span className="font-medium text-ink">{current.label}</span>. Le
          changement est immédiat et sans engagement.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = plan.id === current.id;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-xl border p-6 ${
                isCurrent ? "border-brand-800 bg-brand-950 text-white" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-medium">{plan.label}</h2>
                {isCurrent && (
                  <span className="rounded border border-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-200">
                    Actuelle
                  </span>
                )}
              </div>
              <p className={`mt-1 text-[12px] ${isCurrent ? "text-white/50" : "text-muted"}`}>
                {plan.tagline}
              </p>
              <p className="display mt-5 text-[30px] leading-none">
                {plan.price === 0 ? "0 FCFA" : formatFCFA(plan.price)}
              </p>
              <p className={`mt-1 text-[12px] ${isCurrent ? "text-white/50" : "text-muted"}`}>
                {plan.price === 0 ? "pour toujours" : "par mois"}
              </p>

              <ul className={`mt-5 flex-1 space-y-2 border-t pt-4 text-[12px] ${isCurrent ? "border-white/10" : "border-line"}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Icon
                      name="check"
                      className={`mt-0.5 h-3 w-3 shrink-0 ${isCurrent ? "text-brand-300" : "text-brand-600"}`}
                      strokeWidth={2.4}
                    />
                    <span className={isCurrent ? "text-white/70" : "text-muted"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <form action={updatePlan} className="mt-5">
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className={`btn btn-sm w-full ${isCurrent ? "btn-outline" : "btn-primary"}`}
                >
                  {isCurrent ? "Formule actuelle" : plan.price === 0 ? "Revenir au gratuit" : `Passer à ${plan.label}`}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border border-line bg-white p-5">
        <div className="flex gap-3">
          <Icon name="card" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div>
            <h2 className="text-[14px] font-medium">Paiement par Mobile Money</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Orange Money, MTN MoMo ou Wave. En attendant le paiement automatique, écrivez-nous sur
              WhatsApp : la formule est activée le jour même.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={whatsappLink(
                  "0700000000",
                  `Bonjour, je souhaite activer une formule payante pour la boutique ${merchant.storeName}.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-wa btn-sm"
              >
                <IconWhatsApp className="h-3.5 w-3.5" />
                Activer par WhatsApp
              </a>
              <Link href="/tableau-de-bord" className="btn btn-outline btn-sm">
                Retour
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
