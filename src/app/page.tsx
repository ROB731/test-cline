import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/icons";
import { PLANS } from "@/lib/plans";
import { formatFCFA } from "@/lib/format";
import { AccountDeletedNotice } from "@/components/AccountDeletedNotice";

const demoStore = "/s/chez-awa";

const preview = [
  { name: "Robe longue wax", price: 22000, image: "/uploads/photos/01-ensemble-wax.jpg" },
  { name: "Sac en raphia tressé", price: 12500, image: "/uploads/photos/02-sac-raphia.jpg" },
  { name: "Foulard en soie", price: 6000, image: "/uploads/photos/03-foulard-soie.jpg" },
  { name: "Bracelet perles", price: 3500, image: "/uploads/photos/04-bracelet-perles.jpg" },
];

export default function HomePage() {
  return (
    <main>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
            <a href="#constat" className="hover:text-ink">Le constat</a>
            <a href="#fonctionnement" className="hover:text-ink">Fonctionnement</a>
            <a href="#fonctionnalites" className="hover:text-ink">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-ink">Tarifs</a>
          </nav>
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

      <Suspense fallback={null}>
        <AccountDeletedNotice />
      </Suspense>

      {/* Hero */}
      <section className="border-b border-line">
        <div className="container-page grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="max-w-[520px]">
            <p className="eyebrow">Boutique en ligne pour vendeurs WhatsApp</p>
            <h1 className="display mt-5 text-[42px] leading-[1.04] sm:text-[54px]">
              Votre catalogue mérite mieux qu&apos;un statut WhatsApp.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-muted">
              Vitrine transforme votre activité WhatsApp, Facebook ou Instagram en une boutique
              soignée, accessible par un seul lien. Vos clients parcourent, choisissent, commandent
              — et vous recevez une commande claire au lieu de cinquante messages.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/inscription" className="btn btn-primary">
                Créer ma boutique
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link href={demoStore} className="btn btn-outline">
                Voir une boutique démo
                <Icon name="external" className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
              {[
                { icon: "card" as const, text: "Sans carte bancaire" },
                { icon: "calendar" as const, text: "Prêt en 5 minutes" },
                { icon: "shield" as const, text: "0 FCFA pour démarrer" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2">
                  <Icon name={item.icon} className="h-4 w-4 text-brand-600" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Aperçu de boutique */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-line-strong/70 bg-white shadow-[0_24px_60px_-30px_rgba(17,23,21,0.35)]">
              <div className="flex items-center gap-1.5 border-b border-line bg-paper px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-line-strong" />
                <span className="h-2 w-2 rounded-full bg-line-strong" />
                <span className="h-2 w-2 rounded-full bg-line-strong" />
                <span className="ml-3 truncate rounded bg-white px-2 py-0.5 font-mono text-[10px] text-muted">
                  vitrine.ci/s/chez-awa
                </span>
              </div>

              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <span className="display flex h-9 w-9 items-center justify-center rounded bg-brand-100 text-sm text-brand-800">
                  A
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Chez Awa</p>
                  <p className="text-[11px] text-muted">Cocody, Abidjan · 12 articles</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 text-[10px] font-medium text-brand-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  En ligne
                </span>
              </div>

              <div className="grid grid-cols-2 gap-px bg-line">
                {preview.map((item) => (
                  <div key={item.name} className="bg-white p-2.5">
                    <div className="aspect-square overflow-hidden rounded bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 truncate text-[11px] font-medium">{item.name}</p>
                    <p className="text-[11px] text-brand-700">{formatFCFA(item.price)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-line px-4 py-3">
                <div className="flex items-center justify-center gap-2 rounded-md bg-wa py-2 text-[12px] font-medium text-white">
                  <Icon name="bag" className="h-3.5 w-3.5" />
                  Commander sur WhatsApp
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden w-[210px] rounded-lg border border-line bg-white p-3 shadow-[0_16px_40px_-24px_rgba(17,23,21,0.4)] sm:block">
              <div className="flex items-center gap-2">
                <Icon name="check" className="h-3.5 w-3.5 text-success" />
                <p className="text-[11px] font-medium">Nouvelle commande</p>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted">CMD-2604-A7X2 · 33 000 FCFA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          {[
            ["90 %", "des échanges commerciaux se font sur WhatsApp"],
            ["5 min", "pour mettre sa boutique en ligne"],
            ["0 FCFA", "pour démarrer, sans engagement"],
            ["+225", "numéros ivoiriens pris en charge"],
          ].map(([value, label]) => (
            <div key={label} className="px-4 py-7">
              <p className="display text-[26px] leading-none">{value}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Constat */}
      <section id="constat" className="container-page py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Le constat</p>
            <h2 className="display mt-4 text-[34px] leading-[1.1] sm:text-[40px]">
              Vendre sur WhatsApp fonctionne. Le gérer, beaucoup moins.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Votre activité est réelle. Ce qui manque, c&apos;est un endroit stable où vos clients
              retrouvent vos produits, leurs prix et leurs disponibilités.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {[
              {
                icon: "image" as const,
                title: "Des photos introuvables",
                text: "Vos produits dorment dans la galerie du téléphone et dans des statuts qui expirent en 24 heures.",
              },
              {
                icon: "message" as const,
                title: "Des commandes dispersées",
                text: "Quarante conversations ouvertes, des quantités notées à la main, et des ventes oubliées.",
              },
              {
                icon: "link" as const,
                title: "Aucun lien à partager",
                text: "Rien à mettre en biographie Instagram, dans une publicité ou sur une carte de visite.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6">
                <Icon name={item.icon} className="h-5 w-5 text-brand-600" />
                <h3 className="mt-4 text-[15px] font-medium">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="bg-brand-950 text-white">
        <div className="container-page py-20 md:py-28">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
              Fonctionnement
            </p>
            <h2 className="display mt-4 text-[34px] leading-[1.1] sm:text-[40px]">
              Vous ne créez pas une boutique. Vous rangez la vôtre.
            </h2>
          </div>

          <ol className="mt-14 grid gap-px border-t border-white/10 md:grid-cols-3">
            {[
              [
                "01",
                "Ajoutez vos produits",
                "Photo, prix, taille, stock. Une trentaine de secondes par article, depuis votre téléphone.",
              ],
              [
                "02",
                "Partagez votre lien",
                "Une seule adresse pour la biographie Instagram, le statut WhatsApp, la page Facebook et le QR code.",
              ],
              [
                "03",
                "Recevez la commande",
                "Le client choisit ses articles. Vous recevez un message structuré : référence, quantités, total.",
              ],
            ].map(([step, title, text]) => (
              <li key={step} className="border-b border-white/10 py-8 md:border-b-0 md:border-r md:pr-8 md:last:border-r-0 md:pl-8 md:first:pl-0">
                <span className="font-mono text-[11px] text-brand-300">{step}</span>
                <h3 className="mt-3 text-[17px] font-medium">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">{text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <Link href="/inscription" className="btn btn-accent">
              Ouvrir ma boutique
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="container-page py-20 md:py-28">
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end">
          <div className="max-w-lg">
            <p className="eyebrow">Fonctionnalités</p>
            <h2 className="display mt-4 text-[34px] leading-[1.1] sm:text-[40px]">
              L&apos;essentiel, sans superflu.
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-muted">
            Chaque fonctionnalité répond à un problème concret rencontré par les vendeurs sur les
            réseaux sociaux.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "image" as const, title: "Galerie plein écran", text: "Zoom au doigt, navigation entre les photos, affichage rapide même en connexion lente." },
            { icon: "bag" as const, title: "Panier relié à WhatsApp", text: "Le client compose sa commande et vous recevez un message déjà rédigé, prêt à confirmer." },
            { icon: "box" as const, title: "Stock à jour", text: "Le stock diminue à chaque commande. Plus de « c'est déjà vendu » après paiement." },
            { icon: "link" as const, title: "Un lien unique", text: "vitrine.ci/s/votre-boutique : biographie, statuts, publicités, QR code imprimé." },
            { icon: "chart" as const, title: "Commandes suivies", text: "Nouvelle, confirmée, expédiée, livrée. Vous savez toujours où en est chaque vente." },
            { icon: "phone" as const, title: "Appel en un clic", text: "Le client préfère parler ? Votre numéro est affiché et appelable immédiatement." },
          ].map((item) => (
            <div key={item.title} className="bg-white p-7">
              <Icon name={item.icon} className="h-5 w-5 text-brand-600" />
              <h3 className="mt-5 text-[15px] font-medium">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="border-y border-line bg-white">
        <div className="container-page py-20 md:py-28">
          <div className="max-w-xl">
            <p className="eyebrow">Tarifs</p>
            <h2 className="display mt-4 text-[34px] leading-[1.1] sm:text-[40px]">
              Gratuit pour commencer. Payant quand vous vendez.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Paiement par Orange Money, MTN MoMo ou Wave. Sans engagement de durée.
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
                    <h3 className="text-[15px] font-medium">{plan.label}</h3>
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

                  <ul className={`mt-6 flex-1 space-y-2.5 border-t pt-5 text-[13px] ${highlight ? "border-white/10" : "border-line"}`}>
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
                    {plan.price === 0 ? "Créer ma boutique" : `Choisir ${plan.label}`}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Démo */}
      <section className="container-page py-16 md:py-20">
        <div className="grid items-center gap-8 rounded-xl border border-line bg-white p-8 md:grid-cols-[1.3fr_1fr] md:p-10">
          <div>
            <p className="eyebrow">Démonstration</p>
            <h2 className="display mt-3 text-[28px] leading-tight sm:text-[32px]">
              Parcourez une boutique réelle, de la vitrine à la commande.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              « Chez Awa » est une boutique de démonstration complète : douze articles, un panier
              fonctionnel et une commande transmise au vendeur.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href={demoStore} className="btn btn-primary">
              Ouvrir la boutique
              <Icon name="external" className="h-4 w-4" />
            </Link>
            <Link href="/inscription" className="btn btn-outline">
              Créer la mienne
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="display mt-4 text-[30px] leading-[1.1]">
              Ce que les vendeurs nous demandent.
            </h2>
          </div>
          <dl className="border-t border-line">
            {[
              [
                "Mes clients doivent-ils installer une application ?",
                "Non. Ils ouvrent votre lien, consultent les articles et vous écrivent sur WhatsApp comme ils le font déjà.",
              ],
              [
                "Faut-il payer un abonnement WhatsApp ?",
                "Non. Vitrine utilise un simple lien de conversation (wa.me) : aucun frais par message, aucune validation Meta.",
              ],
              [
                "Puis-je conserver mon numéro actuel ?",
                "Oui. C'est votre numéro WhatsApp Business qui reçoit les commandes. Nous ne le remplaçons pas.",
              ],
              [
                "Comment suis-je payé ?",
                "Directement par le client : Orange Money, MTN MoMo, Wave ou espèces à la livraison. Vitrine ne touche jamais votre argent.",
              ],
              [
                "Mes photos doivent-elles être professionnelles ?",
                "Des photos nettes prises au téléphone suffisent. Le produit, la matière et le prix doivent rester lisibles.",
              ],
              [
                "Puis-je arrêter quand je veux ?",
                "Oui. Le plan gratuit reste gratuit et un plan payant peut être arrêté à la fin du mois en cours.",
              ],
            ].map(([question, answer]) => (
              <div key={question} className="border-b border-line py-5">
                <dt className="text-[14px] font-medium">{question}</dt>
                <dd className="mt-2 text-[13px] leading-relaxed text-muted">{answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-line bg-white">
        <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-[13px] leading-relaxed text-muted">
              La boutique en ligne des vendeurs WhatsApp de Côte d&apos;Ivoire. Abidjan.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Produit</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-ink-soft">
              <li><Link href="/inscription" className="hover:text-brand-700">Créer ma boutique</Link></li>
              <li><Link href={demoStore} className="hover:text-brand-700">Boutique démo</Link></li>
              <li><Link href="/tarifs" className="hover:text-brand-700">Tarifs</Link></li>
              <li><Link href="/conditions" className="hover:text-brand-700">Conditions d&apos;utilisation</Link></li>
              <li><Link href="/confidentialite" className="hover:text-brand-700">Confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Compte</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-ink-soft">
              <li><Link href="/connexion" className="hover:text-brand-700">Se connecter</Link></li>
              <li><Link href="/inscription" className="hover:text-brand-700">Créer un compte</Link></li>
              <li><Link href="/tableau-de-bord" className="hover:text-brand-700">Tableau de bord</Link></li>
            </ul>
          </div>
        </div>
        <div className="container-page flex flex-col gap-2 border-t border-line py-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Vitrine. Tous droits réservés.{" "}
            <Link href="/conditions" className="hover:text-ink">Conditions</Link>{" · "}
            <Link href="/confidentialite" className="hover:text-ink">Confidentialité</Link>
          </p>
          <p>Paiement Orange Money · MTN MoMo · Wave</p>
        </div>
      </footer>
    </main>
  );
}
