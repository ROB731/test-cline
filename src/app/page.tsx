import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PLANS } from "@/lib/plans";
import { formatFCFA } from "@/lib/format";

const demoStore = "/s/chez-awa";

export default function HomePage() {
  return (
    <main>
      {/* ---------- Navigation ---------- */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
            <a href="#probleme" className="hover:text-ink">Le problème</a>
            <a href="#fonctionnalites" className="hover:text-ink">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-ink">Tarifs</a>
            <Link href={demoStore} className="hover:text-ink">Boutique démo</Link>
          </nav>
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

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-accent-100/60 blur-3xl"
        />
        <div className="container-page relative grid items-center gap-12 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="badge border-brand-200 bg-brand-50 text-brand-800">
              🇨🇮 Pensé pour la Côte d&apos;Ivoire
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Ta boutique WhatsApp,
              <span className="text-brand-600"> enfin rangée.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Tu vends sur WhatsApp, Facebook et Instagram ? Crée une vitrine à ton nom,
              partage <strong className="text-ink">un seul lien</strong>, et reçois des commandes
              claires — plus de « combien le rouge ? » toute la journée.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/inscription" className="btn btn-primary text-base">
                Créer ma boutique — gratuit
              </Link>
              <Link href={demoStore} className="btn btn-outline text-base">
                Voir une boutique démo
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Sans carte bancaire · 5 minutes · Prêt pour Orange Money, MTN MoMo et Wave
            </p>
          </div>

          {/* Aperçu téléphone */}
          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="animate-floaty rounded-[2.25rem] border border-line bg-ink p-2.5 shadow-2xl">
              <div className="overflow-hidden rounded-[1.75rem] bg-paper">
                <div className="flex items-center gap-2 bg-brand-700 px-4 py-3 text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                    A
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Chez Awa</p>
                    <p className="text-[10px] text-white/70">Cocody, Abidjan</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2.5">
                  {[
                    ["Ensemble wax", "15 000", "from-amber-200 to-orange-300"],
                    ["Sac raphia", "12 500", "from-emerald-200 to-teal-300"],
                    ["Foulard soie", "6 000", "from-rose-200 to-pink-300"],
                    ["Bracelet perles", "3 500", "from-violet-200 to-indigo-300"],
                  ].map(([name, price, grad]) => (
                    <div key={name} className="overflow-hidden rounded-xl bg-white shadow-sm">
                      <div className={`h-16 bg-gradient-to-br ${grad}`} />
                      <div className="p-2">
                        <p className="truncate text-[11px] font-semibold">{name}</p>
                        <p className="text-[11px] text-brand-700">{price} F</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line px-3 py-2.5">
                  <div className="flex items-center justify-center gap-2 rounded-full bg-wa px-3 py-2 text-xs font-bold text-[#06301c]">
                    Commander sur WhatsApp
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-10 hidden rotate-3 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold shadow-lg sm:block">
              +1 commande 🎉
            </div>
            <div className="absolute -left-6 bottom-16 hidden -rotate-3 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold shadow-lg sm:block">
              CMD-2604-A7X2
            </div>
          </div>
        </div>
      </section>
      {/* ---------- Bandeau chiffres ---------- */}
      <section className="border-y border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-8 text-center md:grid-cols-4">
          {[
            ["90 %", "des échanges se font sur WhatsApp"],
            ["5 min", "pour créer sa vitrine"],
            ["0 FCFA", "pour démarrer"],
            ["+225", "numéros locaux pris en charge"],
          ].map(([big, small]) => (
            <div key={small}>
              <p className="text-2xl font-extrabold text-brand-700">{big}</p>
              <p className="mt-1 text-xs text-muted sm:text-sm">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Problème ---------- */}
      <section id="probleme" className="container-page py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Le quotidien</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Vendre sur WhatsApp, c&apos;est bien. Sans outil, c&apos;est épuisant.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              emoji: "🖼️",
              title: "Tes photos se perdent",
              text: "Elles dorment dans ta galerie et dans tes statuts. Le client doit faire défiler 200 photos pour retrouver le modèle qu'il a vu hier.",
            },
            {
              emoji: "💬",
              title: "Tes commandes vivent dans le chat",
              text: "« C'est combien ? », « Tu livres à Yopougon ? », « Je veux le bleu en M »… 40 conversations ouvertes, et des ventes oubliées.",
            },
            {
              emoji: "🔗",
              title: "Tu n'as aucun lien à partager",
              text: "Impossible de mettre ta boutique en bio Instagram, dans une pub Facebook ou sur ta carte de visite. Tu renvoies vers ton numéro, et beaucoup abandonnent.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">
                {item.emoji}
              </div>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Comment ça marche ---------- */}
      <section className="bg-brand-900 text-white">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-300">En 3 étapes</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tu ne crées pas une boutique. Tu ranges la tienne.
            </h2>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Ajoute tes produits", "Photo, prix, taille, stock. 30 secondes par article. Importe d'un coup toute ta galerie."],
              ["02", "Partage ton lien", "Un seul lien : bio Instagram, statut WhatsApp, page Facebook, carte de visite, QR code."],
              ["03", "Reçois des commandes claires", "Le client choisit ses articles, tu reçois un message formaté avec la référence, la quantité et le total."],
            ].map(([n, title, text]) => (
              <li key={n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="text-sm font-black text-brand-300">{n}</span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-9">
            <Link href="/inscription" className="btn btn-accent">
              Je crée ma vitrine maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Fonctionnalités ---------- */}
      <section id="fonctionnalites" className="container-page py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Fonctionnalités</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tout ce qu&apos;il faut, rien de plus.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["📸", "Galerie plein écran", "Zoom au doigt, glissement entre les photos, chargement rapide même en 3G."],
            ["🛒", "Panier qui parle WhatsApp", "Le client compose sa commande, tu reçois un message structuré, prêt à confirmer."],
            ["📦", "Stock toujours juste", "Le stock baisse à chaque commande. Fini les « c'est déjà vendu »."],
            ["🔗", "Un lien, partout", "vitrine.app/s/ta-boutique : bio, statuts, pubs, QR code imprimé."],
            ["📊", "Commandes suivies", "Nouvelle → Confirmée → Expédiée → Livrée. Tu ne perds plus une vente."],
            ["📞", "Appel en un clic", "Le client préfère appeler ? Le bouton est là, avec ton numéro ivoirien."],
          ].map(([emoji, title, text]) => (
            <div key={title} className="card p-6">
              <span className="text-2xl">{emoji}</span>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Tarifs ---------- */}
      <section id="tarifs" className="border-y border-line bg-white">
        <div className="container-page py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Tarifs</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Commence gratuitement. Paie quand tu vends.
            </h2>
            <p className="mt-3 text-muted">
              Paiement par Orange Money, MTN MoMo ou Wave. Sans engagement.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {Object.values(PLANS).map((plan) => {
              const highlight = plan.id === "PRO";
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 ${
                    highlight
                      ? "border-brand-600 bg-brand-900 text-white shadow-xl"
                      : "border-line bg-white"
                  }`}
                >
                  {highlight && (
                    <span className="absolute -top-3 left-6 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-brand-900">
                      Le plus choisi
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{plan.label}</h3>
                  <p className={`text-sm ${highlight ? "text-white/70" : "text-muted"}`}>
                    {plan.tagline}
                  </p>
                  <p className="mt-4 text-3xl font-extrabold">
                    {plan.price === 0 ? "0 FCFA" : formatFCFA(plan.price)}
                    <span className={`text-sm font-medium ${highlight ? "text-white/60" : "text-muted"}`}>
                      {plan.price === 0 ? " / toujours" : " / mois"}
                    </span>
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className={highlight ? "text-accent-300" : "text-brand-600"}>✓</span>
                        <span className={highlight ? "text-white/85" : "text-muted"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/inscription"
                    className={`btn mt-6 w-full ${highlight ? "btn-accent" : "btn-outline"}`}
                  >
                    {plan.price === 0 ? "Créer ma boutique" : `Choisir ${plan.label}`}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Démo ---------- */}
      <section className="container-page py-16 md:py-24">
        <div className="card relative overflow-hidden p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-100 blur-2xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Regarde à quoi ressemblera ta future vitrine
              </h2>
              <p className="mt-3 text-muted">
                Boutique de démonstration « Chez Awa » : galerie, zoom sur les photos, panier et
                commande WhatsApp en un clic. Tout est fonctionnel.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={demoStore} className="btn btn-primary">
                Ouvrir la boutique démo
              </Link>
              <Link href="/inscription" className="btn btn-outline">
                Créer la mienne
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* ---------- FAQ ---------- */}
      <section className="container-page pb-16 md:pb-24">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Questions fréquentes</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            [
              "Mes clients doivent-ils installer une application ?",
              "Non. Ils ouvrent ton lien, regardent les produits et te contactent sur WhatsApp comme d'habitude.",
            ],
            [
              "Je dois payer un abonnement WhatsApp ?",
              "Non. On utilise un simple lien click-to-chat (wa.me) : aucun frais par message, aucune validation Meta.",
            ],
            [
              "Est-ce que je peux garder mon numéro actuel ?",
              "Oui, c'est ton numéro WhatsApp Business qui reçoit les commandes. On ne le remplace pas.",
            ],
            [
              "Comment je suis payé ?",
              "Directement par ton client : Orange Money, MTN MoMo, Wave, ou en espèces à la livraison. La vitrine ne touche pas à ton argent.",
            ],
            [
              "Et si je n'ai pas de photos professionnelles ?",
              "Des photos nettes prises au téléphone suffisent. L'important est de montrer le produit et le prix.",
            ],
            [
              "Puis-je arrêter quand je veux ?",
              "Oui. Le plan gratuit reste gratuit, et un plan payant peut être arrêté à la fin du mois.",
            ],
          ].map(([q, a]) => (
            <div key={q} className="card p-5">
              <h3 className="font-bold">{q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line bg-white">
        <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm text-muted">
              La vitrine des vendeurs WhatsApp de Côte d&apos;Ivoire. Abidjan, CI.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-muted">
            <Link href="/inscription" className="hover:text-ink">Créer ma boutique</Link>
            <Link href="/connexion" className="hover:text-ink">Connexion</Link>
            <Link href={demoStore} className="hover:text-ink">Boutique démo</Link>
            <Link href="/tarifs" className="hover:text-ink">Tarifs</Link>
          </div>
        </div>
        <div className="container-page border-t border-line py-5 text-xs text-muted">
          © {new Date().getFullYear()} Vitrine. Fait avec ❤️ pour les commerçants ivoiriens.
        </div>
      </footer>
    </main>
  );
}
