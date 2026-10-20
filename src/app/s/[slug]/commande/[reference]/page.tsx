import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate, formatFCFA, statusMeta, whatsappLink } from "@/lib/format";
import { parseItems } from "@/lib/types";
import { IconWhatsApp } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; reference: string }>;
}) {
  const { slug, reference } = await params;

  const merchant = await prisma.merchant.findUnique({ where: { slug } });
  if (!merchant) notFound();

  const order = await prisma.order.findFirst({
    where: { reference, merchantId: merchant.id },
  });
  if (!order) notFound();

  const items = parseItems(order.items);
  const meta = statusMeta(order.status);
  const message = [
    `Bonjour ${merchant.storeName} 👋`,
    `Ma commande ${order.reference} :`,
    ...items.map((item) => `• ${item.quantity} × ${item.name} — ${formatFCFA(item.price * item.quantity)}`),
    `Total : ${formatFCFA(order.total)}`,
    `Nom : ${order.customerName}`,
    `Téléphone : ${order.customerPhone}`,
    order.deliveryNote ? `Livraison : ${order.deliveryNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-dvh bg-paper">
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✅
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Commande enregistrée !</h1>
            <p className="mt-2 text-sm text-muted">
              Ta commande est arrivée chez <strong className="text-ink">{merchant.storeName}</strong>.
              Envoie le message WhatsApp pour la confirmer avec le vendeur.
            </p>
          </div>

          <div className="card mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Référence</p>
                <p className="font-mono text-sm font-bold">{order.reference}</p>
              </div>
              <span className={`badge ${meta.tone}`}>{meta.label}</span>
            </div>

            <ul className="divide-y divide-line px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-3 py-3 text-sm">
                  <span className="text-muted">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-semibold">{formatFCFA(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line px-5 py-4">
              <span className="text-sm font-semibold text-muted">Total</span>
              <span className="text-lg font-extrabold">{formatFCFA(order.total)}</span>
            </div>

            <div className="space-y-1 border-t border-line bg-paper px-5 py-4 text-xs text-muted">
              <p>
                {order.customerName} · {order.customerPhone}
              </p>
              {order.deliveryNote && <p>📍 {order.deliveryNote}</p>}
              <p>Passée le {formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <a
              href={whatsappLink(merchant.whatsapp, message)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wa w-full"
            >
              <IconWhatsApp className="h-4 w-4" />
              Envoyer la commande sur WhatsApp
            </a>
            <Link href={`/s/${slug}`} className="btn btn-outline w-full">
              ← Retour à la boutique
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Astuce : garde cette page en favori pour retrouver ta référence {order.reference}.
          </p>
        </div>
      </div>
    </div>
  );
}
