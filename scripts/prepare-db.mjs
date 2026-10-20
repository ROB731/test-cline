#!/usr/bin/env node
/**
 * Prepare la base SQLite avant le demarrage :
 *  - cree le fichier et le schema s'ils n'existent pas (prisma db push)
 *  - charge les donnees de demonstration si la base est vide
 *  - active le mode WAL pour de meilleures lectures concurrentes
 * Aucun effet destructif : les donnees existantes sont conservees.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dbPath = path.join(root, "prisma", "dev.db");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: root, env: process.env });
  if (result.status !== 0) {
    console.error(`Echec de : ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(dbPath)) {
  console.log("[db] Base absente, creation du schema SQLite...");
  run("npx", ["prisma", "db", "push", "--skip-generate"]);
  console.log("[db] Chargement des donnees de demonstration...");
  run("node", ["prisma/seed.mjs"]);
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const merchants = await prisma.merchant.count();
  if (merchants === 0) {
    console.log("[db] Aucune boutique en base, chargement de la demo...");
    await prisma.$disconnect();
    run("node", ["prisma/seed.mjs"]);
  } else {
    console.log(`[db] SQLite prete (${merchants} boutique(s)).`);
  }

  try {
    await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
  } catch {
    // WAL est optionnel : on ignore si la base ne le permet pas.
  }
} finally {
  await prisma.$disconnect();
}
