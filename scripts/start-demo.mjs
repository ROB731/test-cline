#!/usr/bin/env node
/**
 * Demarre la demo complete :
 *  1. prepare la base SQLite
 *  2. lance Next.js en production
 *  3. ouvre un tunnel public Cloudflare si cloudflared est disponible
 * Ctrl+C arrete proprement les deux processus.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const PORT = process.env.PORT || "3000";

function localBin(name) {
  const candidate = path.join(root, "bin", name);
  return existsSync(candidate) ? candidate : null;
}

const prepare = spawnSync(process.execPath, ["scripts/prepare-db.mjs"], { stdio: "inherit", cwd: root });
if (prepare.status !== 0) process.exit(prepare.status ?? 1);

if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.error("Build absent. Lancez d'abord : npm run build");
  process.exit(1);
}

const server = spawn("npx", ["next", "start", "-p", PORT], { stdio: "inherit", cwd: root });

const children = [server];

function shutdown() {
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(0), 300);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Laisse le temps au serveur de demarrer.
await new Promise((resolve) => setTimeout(resolve, 4000));

const cloudflared = process.env.CLOUDFLARED || localBin("cloudflared");
if (!cloudflared) {
  console.log("\ncloudflared introuvable : la demo reste accessible sur http://localhost:" + PORT);
  console.log("Pour un lien public : telecharger cloudflared dans ./bin/cloudflared, ou definir CLOUDFLARED=/chemin/cloudflared.\n");
} else {
  const tunnel = spawn(cloudflared, ["tunnel", "--url", `http://localhost:${PORT}`, "--no-autoupdate"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(tunnel);

  let printed = false;
  const read = (chunk) => {
    const text = chunk.toString();
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !printed) {
      printed = true;
      console.log(`\nLien public temporaire : ${match[0]}\n`);
    }
  };
  tunnel.stdout.on("data", read);
  tunnel.stderr.on("data", read);
  tunnel.on("exit", (code) => console.log(`Tunnel arrete (code ${code}).`));
}

server.on("exit", (code) => {
  console.log(`Serveur arrete (code ${code}).`);
  shutdown();
});
