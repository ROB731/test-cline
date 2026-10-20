import { describe, expect, it } from "vitest";
import {
  formatFCFA,
  normalizePhone,
  slugify,
  statusMeta,
  telLink,
  toInternationalPhone,
  whatsappLink,
} from "@/lib/format";

describe("formatage FCFA", () => {
  it("affiche un montant en francs CFA", () => {
    expect(formatFCFA(15000).replace(/\s/g, "")).toBe("15000FCFA");
  });
});

describe("numéros ivoiriens", () => {
  it("nettoie les séparateurs", () => {
    expect(normalizePhone("07 00-00.00 00")).toBe("0700000000");
  });

  it("ajoute l'indicatif +225 à un numéro local", () => {
    expect(toInternationalPhone("0700000000")).toBe("2250700000000");
  });

  it("conserve un numéro déjà international", () => {
    expect(toInternationalPhone("+225 07 00 00 00 00")).toBe("2250700000000");
  });

  it("construit un lien click-to-chat encodé", () => {
    expect(whatsappLink("0700000000", "Bonjour & merci")).toBe(
      "https://wa.me/2250700000000?text=Bonjour%20%26%20merci",
    );
  });

  it("construit un lien d'appel", () => {
    expect(telLink("0700000000")).toBe("tel:+2250700000000");
  });
});

describe("identifiants de boutique", () => {
  it("génère un slug propre", () => {
    expect(slugify("Chez Awa — Cocody")).toBe("chez-awa-cocody");
  });
});

describe("statuts de commande", () => {
  it("retombe sur un statut valide", () => {
    expect(statusMeta("LIVREE").label).toBe("Livrée");
    expect(statusMeta("INCONNU").id).toBe("NOUVELLE");
  });
});
