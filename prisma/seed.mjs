import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

function svg({ from, to, letter, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="900" fill="url(#g)"/>
  <circle cx="740" cy="170" r="210" fill="rgba(255,255,255,0.18)"/>
  <circle cx="140" cy="760" r="260" fill="rgba(0,0,0,0.08)"/>
  <text x="450" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="280" font-weight="bold" fill="rgba(255,255,255,0.92)">${letter}</text>
  <text x="450" y="600" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="34" letter-spacing="6" fill="rgba(255,255,255,0.85)">${label}</text>
</svg>`;
}

const PALETTES = [
  ["#f6d365", "#fda085", "A", "WAX"],
  ["#84fab0", "#8fd3f4", "B", "RAPHIA"],
  ["#fbc2eb", "#a6c1ee", "C", "SOIE"],
  ["#c2e9fb", "#a1c4fd", "D", "PERLES"],
  ["#fddb92", "#d1fdff", "E", "CUIR"],
  ["#d4fc79", "#96e6a1", "F", "KARITE"],
  ["#fccb90", "#d57eeb", "G", "SAC"],
  ["#e0c3fc", "#8ec5fc", "H", "PAGNE"],
  ["#f093fb", "#f5576c", "I", "ROBE"],
  ["#4facfe", "#00f2fe", "J", "BIJOUX"],
  ["#fa709a", "#fee140", "K", "FLEURS"],
  ["#30cfd0", "#330867", "L", "NATTES"],
];

const PRODUCTS = [
  { name: "Ensemble wax « Abidjan »", price: 15000, compareAtPrice: 19000, category: "Vêtements", stock: 6, description: "Ensemble deux pièces en wax 100 % coton.\nTailles disponibles : S, M, L, XL.\nCouleurs : jaune safran, indigo.\nLivraison Abidjan sous 48h." },
  { name: "Sac en raphia tressé", price: 12500, compareAtPrice: null, category: "Sacs & accessoires", stock: 4, description: "Sac artisanal tressé à la main par nos partenaires de Grand-Bassam.\nDoublure coton, anse en cuir véritable." },
  { name: "Foulard en soie « Lagune »", price: 6000, compareAtPrice: 8000, category: "Sacs & accessoires", stock: 12, description: "Foulard 90 × 90 cm, soie légère, impression dégradé.\nSe porte au cou ou en headwrap." },
  { name: "Bracelet perles de Bassam", price: 3500, compareAtPrice: null, category: "Sacs & accessoires", stock: 20, description: "Bracelet fait main en perles de verre recyclé.\nModèle unique, ajustable." },
  { name: "Robe longue « Yamoussoukro »", price: 22000, compareAtPrice: null, category: "Vêtements", stock: 3, description: "Robe fluide en pagne, coupe évasée, manches courtes.\nTailles S à XL." },
  { name: "Beurre de karité pur 250 g", price: 2500, compareAtPrice: null, category: "Beauté", stock: 30, description: "Beurre de karité brut non raffiné, sans parfum ajouté.\nPour peau, cheveux et lèvres." },
  { name: "Savon noir africain", price: 1500, compareAtPrice: 2000, category: "Beauté", stock: 25, description: "Savon noir traditionnel à base de cendre de cacao.\nNettoie en douceur, 200 g." },
  { name: "Sandales en cuir cousu main", price: 18000, compareAtPrice: null, category: "Chaussures", stock: 5, description: "Cuir tanné localement, semelle renforcée.\nPointures 37 à 43." },
  { name: "Sac à main cuir camel", price: 27000, compareAtPrice: 32000, category: "Sacs & accessoires", stock: 2, description: "Grand sac à main en cuir, bandoulière amovible.\nDeux compartiments intérieurs." },
  { name: "Coupe-coupe décoré", price: 9000, compareAtPrice: null, category: "Maison", stock: 0, description: "Coupe-coupe traditionnel avec manche sculpté.\nPièce décorative ou usage quotidien." },
  { name: "Coussin bogolan", price: 7500, compareAtPrice: null, category: "Maison", stock: 8, description: "Housse de coussin 45 × 45 cm en bogolan, fermeture zippée.\nGarnissage non inclus." },
  { name: "Boucles d'oreilles laiton", price: 4500, compareAtPrice: 6000, category: "Sacs & accessoires", stock: 15, description: "Boucles d'oreilles martelées en laiton, légères.\nFabriquées à Bouaké." },
];

async function main() {
  const uploads = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploads, { recursive: true });

  const images = [];
  for (let i = 0; i < PALETTES.length; i += 1) {
    const [from, to, letter, label] = PALETTES[i];
    const filename = `demo-${i + 1}.svg`;
    await writeFile(path.join(uploads, filename), svg({ from, to, letter, label }), "utf8");
    images.push(`/uploads/${filename}`);
  }

  // On repart d'une base de démo propre.
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
      bio: "Vêtements en wax, sacs en raphia et beauté naturelle. Fait main à Abidjan, livraison sous 48h.",
      plan: "FREE",
      passwordHash: hashPassword("demo1234"),
    },
  });

  const created = [];
  for (let i = 0; i < PRODUCTS.length; i += 1) {
    const product = PRODUCTS[i];
    const main = images[i % images.length];
    const secondary = images[(i + 3) % images.length];
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
          images: JSON.stringify([main, secondary]),
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

  console.log(`✅ Démo prête : ${created.length} produits, ${orders.length} commandes.`);
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
