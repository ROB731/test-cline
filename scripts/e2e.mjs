import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const log = (ok, msg) => console.log(`${ok ? "✅" : "❌"} ${msg}`);
let failures = 0;
function check(cond, msg) {
  if (!cond) failures += 1;
  log(Boolean(cond), msg);
}

// petit PNG 1x1 pour l'upload
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
writeFileSync("/tmp/photo.png", png);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 420, height: 900 } });

// Bloque les appels externes (wa.me) pour le test
await context.route(/wa\.me|whatsapp/, (route) => route.abort());

const page = await context.newPage();
page.on("pageerror", (error) => console.log("  ⚠️ pageerror:", error.message));

// ---------- 1. Connexion marchand ----------
await page.goto(`${BASE}/connexion`, { waitUntil: "networkidle" });
await page.fill('input[name="phone"]', "0700000000");
await page.fill('input[name="password"]', "demo1234");
await Promise.all([page.waitForURL("**/tableau-de-bord", { timeout: 15000 }), page.click('button[type="submit"]')]);
const dashText = await page.textContent("body");
check(dashText.includes("Bonjour Awa"), "connexion marchand -> tableau de bord");
check(dashText.includes("12/15"), "compteur produits avec limite du plan gratuit");
check(dashText.includes("CMD-2604-A7X2"), "dernières commandes affichées");

// ---------- 2. Création d'un produit avec photo ----------
const productName = `Test E2E ${Date.now()}`;
await page.goto(`${BASE}/tableau-de-bord/produits/nouveau`, { waitUntil: "networkidle" });
await page.fill('input[name="name"]', productName);
await page.fill('input[name="price"]', "8500");
await page.fill('input[name="stock"]', "3");
await page.fill('textarea[name="description"]', "Produit créé par le test automatique.");
await page.setInputFiles('input[type="file"]', "/tmp/photo.png");
await page.waitForSelector('img[alt="Photo 1"]', { timeout: 15000 });
check(true, "upload de la photo (aperçu affiché)");
await Promise.all([
  page.waitForURL("**/tableau-de-bord/produits?cree=1", { timeout: 15000 }),
  page.click('button[type="submit"]'),
]);
const listText = await page.textContent("body");
check(listText.includes("Produit publié"), "produit créé + confirmation");
check(listText.includes(productName), "produit visible dans la liste");

// ---------- 3. Commande client depuis la vitrine ----------
const shop = await context.newPage();
await shop.goto(`${BASE}/s/chez-awa`, { waitUntil: "networkidle" });
const shopText = await shop.textContent("body");
check(shopText.includes("Chez Awa"), "vitrine publique chargée");
check(shopText.includes("Ensemble wax"), "produits affichés dans la galerie");

// ajoute le premier produit disponible
const addButtons = shop.locator('button[aria-label^="Ajouter"]');
const addCount = await addButtons.count();
check(addCount > 0, `boutons d'ajout au panier (${addCount})`);
await addButtons.first().click();
await shop.waitForSelector("text=Voir ma commande", { timeout: 5000 });
await shop.click("text=Voir ma commande");
await shop.waitForSelector("text=Ma commande", { timeout: 5000 });
await shop.click('button:has-text("Continuer")');

const stamp = Date.now().toString().slice(-6);
await shop.fill('input[name="customerName"]', "Client Test");
await shop.fill('input[name="customerPhone"]', `0709${stamp}`);
await shop.fill('input[name="deliveryNote"]', "Cocody, test E2E");
await shop.click('button:has-text("Valider et envoyer sur WhatsApp")');
await shop.waitForURL("**/commande/CMD-**", { timeout: 20000 });
const confirmText = await shop.textContent("body");
check(confirmText.includes("Commande enregistrée"), "page de confirmation de commande");
const reference = (confirmText.match(/CMD-\d{4}-[A-Z0-9]{3}/) || [])[0] ?? "";
check(Boolean(reference), `référence générée : ${reference}`);

// ---------- 4. La commande apparaît chez le marchand ----------
await page.goto(`${BASE}/tableau-de-bord/commandes`, { waitUntil: "networkidle" });
const ordersText = await page.textContent("body");
check(ordersText.includes("Client Test"), "commande visible côté marchand");
check(ordersText.includes(reference), "référence identique côté marchand");

// ---------- 5. Changement de statut ----------
const card = page.locator("article", { hasText: reference }).first();
await card.locator("select").selectOption("CONFIRMEE");
await page.waitForTimeout(1500);
await page.reload({ waitUntil: "networkidle" });
check((await page.textContent("body")).includes("Confirmée"), "changement de statut persisté");

// ---------- 6. Déconnexion ----------
await page.goto(`${BASE}/tableau-de-bord`, { waitUntil: "networkidle" });
await page.click('button:has-text("Déconnexion")');
await page.waitForURL(`${BASE}/`, { timeout: 10000 });
check(true, "déconnexion");

await browser.close();
console.log(failures === 0 ? "\n🎉 Tous les tests sont passés." : `\n❌ ${failures} test(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
