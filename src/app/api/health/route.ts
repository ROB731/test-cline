import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Controle de sante : sert a verifier que le serveur et la base SQLite repondent. */
export async function GET() {
  try {
    const [merchants, products, orders] = await Promise.all([
      prisma.merchant.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      database: "sqlite",
      counts: { merchants, products, orders },
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Base de donnees indisponible." },
      { status: 503 },
    );
  }
}
