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

**Côté vendeur**
- Inscription en 1 minute (nom, boutique, téléphone, mot de passe) → lien `/s/ma-boutique`.
- Ajout de produits avec upload de photos (jusqu'à 6), prix, ancien prix, catégorie, stock, visibilité.
- Tableau de bord : CA, nouvelles commandes, produits, alertes de stock faible.
- Gestion des commandes : Nouvelle → Confirmée → Expédiée → Livrée / Annulée (le stock est restitué à l'annulation).
- Contact client en un clic (WhatsApp avec récapitulatif pré-rempli, ou appel).
- Réglages de la boutique : nom, lien, ville, présentation, logo, numéros.
- Abonnement : Gratuit / Pro / Business avec limites appliquées côté serveur.

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
| `npm test` | tests d'intégration (SQLite de test séparée) |
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
  schema.prisma                  Merchant / Product / Order
  seed.mjs                       données de démonstration
scripts/e2e.mjs                  parcours Playwright (optionnel)
tests/                           tests Vitest
```

---

## Décisions techniques importantes

- **Les prix ne viennent jamais du navigateur.** `createPublicOrder` recharge les produits en base,
  recalcule le total et vérifie le stock avant d'écrire la commande.
- **Commande + décrément de stock dans une transaction** Prisma : pas de survente.
- **Annulation = restitution du stock**, calculée à partir des lignes de la commande.
- **Aucune API WhatsApp** : uniquement des liens `wa.me` (click-to-chat). Zéro coût par message,
  zéro validation Meta, aucun risque de blocage de compte.
- **Limites de plan appliquées côté serveur** (pas seulement dans l'UI).
- **Upload** : type MIME et taille contrôlés, nom de fichier aléatoire, session obligatoire.
- **Sessions** : cookie `httpOnly`, `sameSite=lax`, `secure` en production, signature HMAC + expiration.

## Modèle économique

| Plan | Prix | Limite |
|---|---|---|
| Gratuit | 0 FCFA | 15 produits, badge « Vitrine » |
| Pro | 5 000 FCFA/mois | 200 produits, sans badge, statistiques |
| Business | 15 000 FCFA/mois | produits illimités, accompagnement |

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

## Tests

```bash
npm test
```

La suite couvre : formatage FCFA et liens WhatsApp, création de commande publique (total recalculé,
prix client ignoré, stock décrémenté, refus si stock insuffisant / produit masqué / panier vide),
changement de statut, restitution du stock à l'annulation et isolation entre boutiques.

### E2E navigateur (optionnel)

`scripts/e2e.mjs` déroule le parcours complet (connexion, création de produit avec photo, commande
client, statut, déconnexion). Il nécessite les navigateurs Playwright et les bibliothèques système :

```bash
npx playwright install --with-deps chromium
npm run build && npm start   # dans un autre terminal
npm run test:e2e
```
