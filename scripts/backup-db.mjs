#!/usr/bin/env node
/** Copie la base SQLite dans backups/ avec un horodatage. */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "prisma", "dev.db");

if (!existsSync(source)) {
  console.error("Aucune base a sauvegarder (prisma/dev.db absent).");
  process.exit(1);
}

const dir = path.join(root, "backups");
mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const target = path.join(dir, `vitrine-${stamp}.db`);
copyFileSync(source, target);
console.log(`Sauvegarde creee : ${path.relative(root, target)}`);
