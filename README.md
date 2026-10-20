# Vitrine — la vitrine des vendeurs WhatsApp 🇨🇮

> « Ta boutique WhatsApp, enfin rangée. »

Vitrine est une application web qui donne aux vendeurs ivoiriens qui vendent sur WhatsApp,
Facebook et Instagram une **boutique publique à leur nom**, un **lien unique à partager** et des
**commandes claires** au lieu de dizaines de conversations dans le désordre.

Le vendeur n'a **aucune boutique à créer** : il importe ses produits, partage son lien, et continue
à discuter avec ses clients sur WhatsApp comme avant.

---

## Le problème

- Les photos produits se perdent dans la galerie et dans les statuts WhatsApp.
- Les commandes vivent dans le chat : « c'est combien ? », « tu livres à Yopougon ? », « je veux le bleu en M ».
- Le vendeur n'a aucun lien à mettre en bio Instagram ou dans une publicité Facebook.
- Le catalogue natif WhatsApp Business n'est pas indexé, n'a pas de vraie commande et ne gère pas le stock.

## La solution (v0 livrée)

**Compte et connexion**
- Inscription avec acceptation des conditions et mot de passe contrôlé (8 caractères, lettre + chiffre).
- Vérification du numéro par code SMS à 6 chiffres (10 minutes, 5 tentatives, renvoi limité).
- Connexion avec « rester connecté » (30 jours au lieu de 24 heures) et 5 tentatives maximum par quart d'heure.
- Mot de passe oublié par code SMS, puis révocation de toutes les sessions.
- Page Compte : profil, changement de mot de passe, changement de numéro vérifié, appareils connectés révocables, suppression définitive du compte.
- Redirection après connexion vers la page demandée (`?next=`) et protection des routes.
- Pages Conditions d'utilisation et Politique de confidentialité.

**Côté vendeur**
- Inscription en 1 minute (nom, boutique, téléphone, mot de passe) → lien `/s/ma-boutique`.
- Ajout de produits avec upload de photos (jusqu'à 6), prix, ancien prix, catégorie, stock, visibilité.
- Tableau de bord : CA, nouvelles commandes, produits, alertes de stock faible.
- Gestion des commandes : Nouvelle → Confirmée → Expédiée → Livrée / Annulée (le stock est restitué à l'annulation).
- Contact client en un clic (WhatsApp avec récapitulatif pré-rempli, ou appel).
- Réglages de la boutique : nom, lien, ville, présentation, logo, numéros.
- Abonnement : Gratuit / Essentiel / Pro avec limites appliquées côté serveur.

**Côté client (sans compte, sans application)**
- Vitrine mobile-first : en-tête boutique, recherche, filtres par catégorie, grille de produits.
- Fiche produit avec **galerie plein écran** : zoom au pincement, double-tap, glissement pour changer de photo.
- Panier persistant (localStorage) avec quantités.
- Validation de commande : nom, téléphone, note de livraison → commande enregistrée + message WhatsApp pré-rempli.
- Page de confirmation avec référence (`CMD-2604-A7X2`).

---

## Stack

| Élément | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Langage | TypeScript strict |
| Styles | Tailwind CSS 4 |
| Typographie | Inter (interface) + Instrument Serif (titres), auto-hébergées |
| Iconographie | jeu d'icônes SVG maison (`src/components/icons.tsx`), aucun emoji |
| Données | Prisma 6 + SQLite (dev) → PostgreSQL (prod) |
| Auth | Session signée HMAC-SHA256 + `scrypt` (aucune dépendance externe) |
| Tests | Vitest (base SQLite dédiée) |

---

## Démarrage

```bash
npm install
cp .env.example .env      # puis changer AUTH_SECRET
npm run setup             # prisma generate + db push + données de démo
npm run dev               # http://localhost:3000
```

### Compte de démonstration

| Champ | Valeur |
|---|---|
| Téléphone | `0700000000` |
| Mot de passe | `demo1234` |
| Vitrine | `/s/chez-awa` |

12 produits, 3 commandes et des visuels de démonstration sont générés par le seed.

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` / `npm start` | build et serveur de production |
| `npm run setup` | génère le client Prisma, la base et les données de démo |
| `npm run db:reset` | réinitialise la base de démo |
| `npm run typecheck` | vérification TypeScript |
| `npm test` | 36 tests d'intégration (SQLite de test séparée) |
| `npm run demo` | prépare la base, lance le serveur et ouvre un tunnel public |
| `npm run db:backup` | copie la base SQLite dans `backups/` avec un horodatage |
| `npm run test:e2e` | parcours navigateur Playwright (optionnel, voir plus bas) |

---

## Structure

```
src/
  app/
    page.tsx                     landing (problème, fonctionnement, tarifs, FAQ)
    inscription/ connexion/      auth marchand
    tableau-de-bord/             dashboard (accueil, produits, commandes, boutique, abonnement)
    s/[slug]/                    vitrine publique + fiche produit + confirmation de commande
    api/upload/                  upload photo (session requise, 5 Mo max)
  components/
    store/                       StoreCatalog, CartSheet, ProductGallery, Lightbox, ProductActions
    ...                          formulaires et navigation
  lib/
    actions/                     Server Actions (auth, produits, commandes, boutique)
    auth.ts db.ts plans.ts format.ts cart.ts types.ts
prisma/
  schema.prisma                  Merchant / Product / Order / Session / VerificationCode / RateLimit
  seed.mjs                       données de démonstration
scripts/e2e.mjs                  parcours Playwright (optionnel)
tests/                           tests Vitest
```

---

## Base de données (SQLite)

Le projet tourne volontairement sur **SQLite** pour cette phase : aucun serveur de base à
installer, un seul fichier à sauvegarder, et des performances suffisantes pour des dizaines de
boutiques.

| Élément | Emplacement |
|---|---|
| Base de démonstration | `prisma/dev.db` |
| Base des tests | `prisma/test.db` (recréée à chaque `npm test`) |
| Photos envoyées par les marchands | `storage/uploads/` (hors de `public/`) |
| Sauvegardes | `backups/vitrine-<date>.db` |

**Initialisation automatique.** `npm start` exécute `scripts/prepare-db.mjs` : si le fichier
n'existe pas, le schéma est créé et les données de démonstration sont chargées ; si la base existe,
elle est conservée telle quelle. Le mode WAL est activé quand la base le permet.

**Sauvegarde et restauration.**

```bash
npm run db:backup                 # copie horodatée dans backups/
cp backups/vitrine-<date>.db prisma/dev.db   # restauration
```

**Repartir de zéro.** `npm run db:reset` remet la démo dans son état initial (suppression des
comptes créés, des produits et des commandes).

**Photos envoyées par les marchands.** Next.js ne sert que les fichiers de `public/` présents au
moment du build : un fichier déposé à l'exécution renvoie 404. Les photos sont donc écrites dans
`storage/uploads/` et servies par la route `/media/<fichier>` (nom de fichier validé, extensions
limitées aux images, cache immutable). Les visuels de démonstration restent dans
`public/uploads/photos/` car ils font partie du build.

Pensez à sauvegarder `storage/uploads/` en même temps que la base : `tar czf backups/media-<date>.tgz storage/uploads`.

**Surveillance.** `GET /api/health` renvoie l'état du serveur et le nombre de boutiques, produits
et commandes : pratique pour vérifier qu'une instance répond et que la base est accessible.

**Passage à PostgreSQL.** Le schéma est compatible : changer `provider` dans
`prisma/schema.prisma`, mettre à jour `DATABASE_URL`, puis `npx prisma db push`. Aucune requête
du code applicatif n'est spécifique à SQLite.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | SQLite en dev, PostgreSQL en production |
| `AUTH_SECRET` | Signature des sessions et des codes (obligatoire en production) |
| `NEXT_PUBLIC_APP_URL` | URL publique utilisée pour afficher les liens de boutique |
| `SMS_WEBHOOK_URL` | Endpoint appelé pour envoyer les codes par SMS (facultatif) |
| `SMS_API_KEY` | Jeton envoyé à cet endpoint (facultatif) |

Sans `SMS_WEBHOOK_URL`, aucun SMS n'est envoyé : le code est écrit dans les logs et affiché
à l'écran hors production (mode démonstration).

## Décisions techniques importantes

- **Les prix ne viennent jamais du navigateur.** `createPublicOrder` recharge les produits en base,
  recalcule le total et vérifie le stock avant d'écrire la commande.
- **Commande + décrément de stock dans une transaction** Prisma : pas de survente.
- **Annulation = restitution du stock**, calculée à partir des lignes de la commande.
- **Aucune API WhatsApp** : uniquement des liens `wa.me` (click-to-chat). Zéro coût par message,
  zéro validation Meta, aucun risque de blocage de compte.
- **Limites de plan appliquées côté serveur** (pas seulement dans l'UI).
- **Upload** : type MIME et taille contrôlés, nom de fichier aléatoire, session obligatoire.
- **Sessions** : cookie `httpOnly`, `sameSite=lax`, `secure` en production. Jeton aléatoire de 32 octets, seule son empreinte SHA-256 est stockée, ce qui permet la révocation appareil par appareil.
- **Codes SMS** : hachés en base, expiration 10 minutes, 5 tentatives maximum, ancien code invalidé à chaque renvoi, 5 envois par quart d'heure.
- **Anti-énumération** : la demande de réinitialisation renvoie toujours le même message, que le numéro existe ou non.

## Modèle économique

| Plan | Prix | Limite |
|---|---|---|
| Gratuit | 0 FCFA | 15 produits, badge « Vitrine » |
| Essentiel | 1 500 FCFA/mois | 100 produits, sans mention Vitrine |
| Pro | 3 000 FCFA/mois | produits illimités, statistiques, export |

Paiement prévu par Orange Money, MTN MoMo et Wave. En v0, l'activation se fait manuellement
via WhatsApp depuis l'onglet Abonnement.

---

## Limites connues (assumées pour la v0)

1. **Upload local** dans `public/uploads` : à remplacer par Cloudinary / S3 / R2 avant de déployer
   sur une plateforme serverless.
2. **Paiement non intégré** : le client paie le vendeur (Mobile Money ou à la livraison).
3. **SQLite** : passer `provider` en `postgresql` dans `prisma/schema.prisma` et mettre à jour
   `DATABASE_URL` pour la production.
4. **Pas de multi-vendeurs** ni de gestion de variantes (taille/couleur) : la description libre les couvre.
5. **Pas d'e-mails** : la notification marchand se fait dans le dashboard (les notifications
   WhatsApp/SMS sont une V2 évidente).

## Prochaines étapes recommandées

1. Import en masse depuis une galerie de photos / un export Facebook (le vrai différenciateur).
2. Notifications au vendeur (WhatsApp Cloud API ou SMS) à chaque commande.
3. Paiement Mobile Money + frais de livraison par zone d'Abidjan.
4. Variantes produit (taille, couleur) et codes promo.
5. Statistiques de visites et de conversion par produit.
6. Multi-utilisateurs pour les boutiques qui grandissent.

---

## Photos de démonstration

Les douze produits de la boutique « Chez Awa » utilisent des photographies réelles issues de
Pexels (licence autorisant l'usage commercial). Les fichiers sont dans
`public/uploads/photos/` et les sources sont listées dans `public/uploads/photos/CREDITS.md`.

Pour remplacer une photo : dépose le fichier dans `public/uploads/photos/` et mets à jour le
chemin dans `prisma/seed.mjs`, puis relance `npm run db:reset`.

## Tests

```bash
npm test
```

La suite couvre : formatage FCFA et liens WhatsApp, création de commande publique (total recalculé,
prix client ignoré, stock décrémenté, refus si stock insuffisant / produit masqué / panier vide),
changement de statut, restitution du stock à l'annulation, isolation entre boutiques, hachage des
mots de passe, codes SMS (validité, expiration, tentatives, renvoi, limitation), inscription,
connexion et limitation des tentatives, récupération de mot de passe, changement de mot de passe,
vérification du numéro, changement de numéro et suppression de compte.

### E2E navigateur (optionnel)

`scripts/e2e.mjs` déroule le parcours complet (connexion, création de produit avec photo, commande
client, statut, déconnexion). Il nécessite les navigateurs Playwright et les bibliothèques système :

```bash
npx playwright install --with-deps chromium
npm run build && npm start   # dans un autre terminal
npm run test:e2e
```
