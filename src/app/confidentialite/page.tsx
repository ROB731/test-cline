import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Politique de confidentialité — Vitrine" };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="octobre 2026">
      <section>
        <h2 className="text-[15px] font-medium text-ink">Données collectées</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Compte : nom, nom de la boutique, numéro de téléphone, ville, e-mail facultatif, mot de passe chiffré.</li>
          <li>Boutique : produits, photos, prix, stock, lien public.</li>
          <li>Commandes : nom, numéro de téléphone, note de livraison et articles commandés.</li>
          <li>Technique : adresse IP, navigateur et dates de connexion, pour sécuriser le compte.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">Pourquoi ces données</h2>
        <p className="mt-2">
          Afficher votre catalogue, transmettre les commandes au vendeur, sécuriser l&apos;accès au
          compte, vous envoyer les codes de vérification et établir des statistiques agrégées
          d&apos;utilisation.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">Mot de passe et codes</h2>
        <p className="mt-2">
          Les mots de passe ne sont jamais stockés en clair : ils sont transformés par une fonction de
          dérivation (scrypt) avec un sel unique. Les codes de vérification sont également stockés sous
          forme hachée, expirent au bout de 10 minutes et sont limités à 5 tentatives.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">Durée de conservation</h2>
        <p className="mt-2">
          Les données de compte sont conservées tant que le compte existe. Les commandes sont
          conservées pour la gestion commerciale du vendeur. Les sessions expirent après 1 jour, ou
          30 jours si vous choisissez « rester connecté ».
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">Destinataires</h2>
        <p className="mt-2">
          Les données sont accessibles au vendeur concerné et aux prestataires techniques nécessaires
          au fonctionnement du service (hébergement, envoi de SMS). Elles ne sont pas revendues.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">Vos droits</h2>
        <p className="mt-2">
          Vous pouvez consulter et corriger vos informations depuis la page Compte, révoquer vos
          sessions, et supprimer définitivement votre compte et son contenu. Pour toute demande :
          contact@vitrine.ci.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">Cookies</h2>
        <p className="mt-2">
          Un seul cookie est nécessaire au fonctionnement : le cookie de session, qui vous garde
          connecté. Aucun cookie publicitaire n&apos;est utilisé. Le panier des clients de la vitrine est
          stocké localement dans leur navigateur, pas sur nos serveurs.
        </p>
      </section>

      <p className="rounded-lg border border-line bg-paper px-4 py-3 text-[11.5px] text-muted">
        Ce document est un modèle de départ, à faire valider par un juriste et à compléter avec les
        coordonnées de votre structure.
      </p>
    </LegalPage>
  );
}
