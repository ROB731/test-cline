import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Upload d'une photo produit.
 * Stockage local dans /public/uploads pour le prototype.
 * En production : remplacer par Cloudinary / S3 / R2.
 */
export async function POST(request: Request) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const data = await request.formData();
  const file = data.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!EXTENSIONS[file.type]) {
    return NextResponse.json(
      { error: "Format non supporté. Utilise JPG, PNG, WEBP ou AVIF." },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Photo trop lourde (5 Mo maximum)." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const name = `${randomUUID()}.${EXTENSIONS[file.type]}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);

  return NextResponse.json({ url: `/uploads/${name}` });
}
