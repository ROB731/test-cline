import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Sert les photos envoyees par les marchands.
 * Les fichiers sont stockes hors de /public car Next.js ne sert que les fichiers
 * presents au moment du build dans public/.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(file) || file.includes("..")) {
    return new NextResponse("Introuvable", { status: 404 });
  }

  const extension = file.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return new NextResponse("Introuvable", { status: 404 });
  }

  try {
    const data = await readFile(path.join(process.cwd(), "storage", "uploads", file));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "content-type": contentType,
        "content-length": String(data.byteLength),
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Introuvable", { status: 404 });
  }
}
