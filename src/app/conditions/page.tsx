import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Conditions d'utilisation — Vitrine" };

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions d'utilisation" updated="octobre 2026">
      <section>
        <h2 className="text-[15px] font-medium text-ink">1. Objet</h2>
        <p className="mt-2">
          Vitrine est un service de vitrine en ligne destiné aux commerçants qui vendent via WhatsApp,
          Facebook ou Instagram. Le service permet de présenter un catalogue, de partager un lien
          public et de transmettre des commandes au vendeur.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">2. Compte et sécurité</h2>
        <p className="mt-2">
          Le compte est créé avec un numéro de téléphone ivoirien et un mot de passe personnel. Vous
          êtes responsable de la confidentialité de vos identifiants et des actions effectuées depuis
          votre compte. La vérification du numéro par code SMS est recommandée et peut être exigée
          pour certaines fonctionnalités.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">3. Rôle de Vitrine dans la vente</h2>
        <p className="mt-2">
          Vitrine met en relation le vendeur et son client. La vente est conclue directement entre
          eux : prix, qualité, paiement, livraison, retours et garanties relèvent de la
          responsabilité du vendeur. Vitrine n&apos;encaisse pas les paiements des clients finaux.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">4. Contenus publiés</h2>
        <p className="mt-2">
          Le vendeur garantit détenir les droits sur les photos, textes et marques qu&apos;il publie, et
          s&apos;engage à ne pas proposer de produits interdits par la loi ivoirienne. Les contenus
          manifestement illicites peuvent être retirés.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">5. Formules et paiement</h2>
        <p className="mt-2">
          La formule gratuite est limitée à 15 produits et affiche la mention Vitrine. Les formules
          Essentiel (1 500 FCFA/mois) et Pro (3 000 FCFA/mois) sont sans engagement de durée et
          réglées par Mobile Money. Une formule payante peut être arrêtée à la fin de la période en
          cours ; la formule gratuite reste accessible.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">6. Disponibilité et responsabilité</h2>
        <p className="mt-2">
          Le service est fourni « en l&apos;état ». Nous faisons raisonnablement notre possible pour
          assurer sa disponibilité, sans garantie d&apos;absence d&apos;interruption. Notre responsabilité
          ne saurait être engagée pour un manque à gagner, une perte de données ou un litige entre un
          vendeur et son client.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">7. Suspension et suppression</h2>
        <p className="mt-2">
          Vous pouvez supprimer votre compte à tout moment depuis la page Compte. La suppression
          efface la boutique, les produits et l&apos;historique des commandes. Un compte peut être
          suspendu en cas de fraude, d&apos;usage abusif ou de non-respect de ces conditions.
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-medium text-ink">8. Droit applicable</h2>
        <p className="mt-2">
          Ces conditions sont soumises au droit ivoirien. En cas de litige, une solution amiable sera
          recherchée avant toute action judiciaire devant les juridictions compétentes d&apos;Abidjan.
        </p>
      </section>

      <p className="rounded-lg border border-line bg-paper px-4 py-3 text-[11.5px] text-muted">
        Ce document est un modèle de départ. Avant une exploitation commerciale, faites-le relire par
        un juriste afin de l&apos;adapter à votre structure et à vos obligations.
      </p>
    </LegalPage>
  );
}
