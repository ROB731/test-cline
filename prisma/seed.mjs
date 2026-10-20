import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

// Photos : Pexels, licence Pexels (usage commercial autorise).
// Voir public/uploads/photos/CREDITS.md pour les sources.
const PRODUCTS = [
  {
    photo: "01-ensemble-wax.jpg",
    name: "Robe longue wax « Abidjan »",
    price: 22000,
    compareAtPrice: null,
    category: "Vêtements",
    stock: 3,
    description:
      "Robe longue fluide en tissu wax, coupe évasée et ceinture assortie.\nTailles disponibles : S, M, L, XL.\nLivraison à Abidjan sous 48 h.",
  },
  {
    photo: "02-sac-raphia.jpg",
    name: "Sac en raphia tressé",
    price: 12500,
    compareAtPrice: null,
    category: "Sacs & accessoires",
    stock: 4,
    description:
      "Sac rond tressé à la main en raphia naturel, motif rose.\nAnse renforcée, format 30 cm.\nPièce unique réalisée à Grand-Bassam.",
  },
  {
    photo: "03-foulard-soie.jpg",
    name: "Foulard en soie « Lagune »",
    price: 6000,
    compareAtPrice: 8000,
    category: "Sacs & accessoires",
    stock: 12,
    description:
      "Foulard 90 × 90 cm en soie légère, imprimé graphique orange et bleu.\nSe porte au cou, en headwrap ou noué au sac.",
  },
  {
    photo: "04-bracelet-perles.jpg",
    name: "Bracelet perles de Bassam",
    price: 3500,
    compareAtPrice: null,
    category: "Sacs & accessoires",
    stock: 20,
    description:
      "Bracelet monté sur perles de verre recyclé, tons turquoise.\nFermoir réglable, pièce unique.",
  },
  {
    photo: "05-robe-longue.jpg",
    name: "Haut en wax « Bassam »",
    price: 13500,
    compareAtPrice: null,
    category: "Vêtements",
    stock: 5,
    description:
      "Haut cintré en pagne imprimé, manches longues et ceinture nouée.\nTailles S à L.\nConfection artisanale à Abidjan.",
  },
  {
    photo: "06-beurre-karite.jpg",
    name: "Beurre de karité pur 250 g",
    price: 2500,
    compareAtPrice: null,
    category: "Beauté",
    stock: 30,
    description:
      "Beurre de karité brut, non raffiné et sans parfum ajouté.\nPour la peau, les cheveux et les lèvres.\nPot de 250 g.",
  },
  {
    photo: "07-savon-noir.jpg",
    name: "Savon artisanal doux",
    price: 1500,
    compareAtPrice: 2000,
    category: "Beauté",
    stock: 25,
    description:
      "Savon saponifié à froid aux huiles végétales, parfum agrumes.\nConvient aux peaux sensibles.\nPain de 120 g.",
  },
  {
    photo: "08-sandales-cuir.jpg",
    name: "Sandales en cuir cousu main",
    price: 18000,
    compareAtPrice: null,
    category: "Chaussures",
    stock: 5,
    description:
      "Sandales en cuir tanné localement, semelle renforcée.\nCousues main par nos artisans.\nPointures 37 à 43.",
  },
  {
    photo: "09-sac-cuir-camel.jpg",
    name: "Sac à main cuir camel",
    price: 27000,
    compareAtPrice: 32000,
    category: "Sacs & accessoires",
    stock: 2,
    description:
      "Grand cabas en cuir grainé, anses renforcées et doublure textile.\nDeux compartiments intérieurs, fermeture zippée.",
  },
  {
    photo: "10-panier-tresse.jpg",
    name: "Panier de rangement tressé",
    price: 9000,
    compareAtPrice: null,
    category: "Maison",
    stock: 6,
    description:
      "Panier en fibres naturelles tressées, deux anses.\nIdéal pour le linge ou les objets du quotidien.\nHauteur 35 cm.",
  },
  {
    photo: "11-coussin-bogolan.jpg",
    name: "Coussin en bogolan",
    price: 7500,
    compareAtPrice: null,
    category: "Maison",
    stock: 8,
    description:
      "Housse de coussin 45 × 45 cm en tissu bogolan, fermeture zippée.\nGarnissage non inclus.\nMotif géométrique noir et écru.",
  },
  {
    photo: "12-boucles-laiton.jpg",
    name: "Boucles d'oreilles laiton",
    price: 4500,
    compareAtPrice: 6000,
    category: "Sacs & accessoires",
    stock: 15,
    description:
      "Créoles ovales en laiton doré et argenté, légères à porter.\nFermoir sécurisé.\nFabriquées à Bouaké.",
  },
];

async function main() {
  // On repart d'une base de démonstration propre.
  await prisma.merchant.deleteMany({ where: { phone: "0700000000" } });

  const merchant = await prisma.merchant.create({
    data: {
      name: "Awa Koné",
      storeName: "Chez Awa",
      slug: "chez-awa",
      phone: "0700000000",
      whatsapp: "0700000000",
      callNumber: "0700000000",
      city: "Cocody, Abidjan",
      bio: "Prêt-à-porter en wax, sacs en raphia et soins naturels. Confection artisanale à Abidjan, livraison sous 48 h.",
      plan: "FREE",
      phoneVerified: true,
      lastLoginAt: new Date(),
      passwordHash: hashPassword("demo1234"),
    },
  });

  const created = [];
  for (const product of PRODUCTS) {
    created.push(
      await prisma.product.create({
        data: {
          merchantId: merchant.id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          category: product.category,
          stock: product.stock,
          active: true,
          images: JSON.stringify([`/uploads/photos/${product.photo}`]),
        },
      }),
    );
  }

  const orders = [
    {
      reference: "CMD-2604-A7X2",
      customerName: "Mariam Traoré",
      customerPhone: "0708091011",
      deliveryNote: "Yopougon, près de la pharmacie Sipca",
      status: "NOUVELLE",
      lines: [
        { product: created[0], quantity: 1 },
        { product: created[2], quantity: 2 },
      ],
    },
    {
      reference: "CMD-2604-B3K9",
      customerName: "Jean-Marc Kouassi",
      customerPhone: "0744556677",
      deliveryNote: "Cocody Angré, 7e tranche",
      status: "CONFIRMEE",
      lines: [{ product: created[4], quantity: 1 }],
    },
    {
      reference: "CMD-2604-C8P1",
      customerName: "Fatou Bamba",
      customerPhone: "0755667788",
      deliveryNote: "Marcory Zone 4",
      status: "LIVREE",
      lines: [{ product: created[5], quantity: 2 }],
    },
  ];

  for (const order of orders) {
    const items = order.lines.map((line) => ({
      productId: line.product.id,
      name: line.product.name,
      price: line.product.price,
      quantity: line.quantity,
    }));
    await prisma.order.create({
      data: {
        reference: order.reference,
        merchantId: merchant.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryNote: order.deliveryNote,
        status: order.status,
        items: JSON.stringify(items),
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      },
    });
  }

  console.log(`Demo prete : ${created.length} produits, ${orders.length} commandes.`);
  console.log("   Boutique : /s/chez-awa");
  console.log("   Connexion : 0700000000 / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
