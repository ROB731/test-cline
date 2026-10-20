import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate, formatFCFA, statusMeta, whatsappLink } from "@/lib/format";
import { parseItems } from "@/lib/types";
import { Icon, IconWhatsApp } from "@/components/icons";

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
    `Bonjour ${merchant.storeName},`,
    `Ma commande ${order.reference} :`,
    ...items.map((item) => `- ${item.quantity} x ${item.name} (${formatFCFA(item.price * item.quantity)})`),
    `Total : ${formatFCFA(order.total)}`,
    `Nom : ${order.customerName}`,
    `Téléphone : ${order.customerPhone}`,
    order.deliveryNote ? `Livraison : ${order.deliveryNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-dvh bg-paper">
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-brand-50">
            <Icon name="check" className="h-5 w-5 text-brand-700" strokeWidth={2.2} />
          </span>
          <h1 className="display mt-4 text-[30px] leading-tight">Commande enregistrée</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            Votre commande est parvenue à <span className="font-medium text-ink">{merchant.storeName}</span>.
            Envoyez le message WhatsApp pour la confirmer avec le vendeur.
          </p>

          <div className="card mt-7 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                  Référence
                </p>
                <p className="mt-0.5 font-mono text-[13px] font-medium">{order.reference}</p>
              </div>
              <span className={`badge ${meta.tone}`}>{meta.label}</span>
            </div>

            <ul className="divide-y divide-line px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-3 py-3 text-[13px]">
                  <span className="text-muted">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-medium">{formatFCFA(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line px-5 py-4">
              <span className="text-[13px] font-medium text-muted">Total</span>
              <span className="text-[17px] font-medium">{formatFCFA(order.total)}</span>
            </div>

            <div className="space-y-1.5 border-t border-line bg-paper px-5 py-4 text-[12px] text-muted">
              <p>
                {order.customerName} · {order.customerPhone}
              </p>
              {order.deliveryNote && (
                <p className="flex gap-2">
                  <Icon name="truck" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {order.deliveryNote}
                </p>
              )}
              <p>Commande passée le {formatDate(order.createdAt)}</p>
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
              <Icon name="arrowLeft" className="h-4 w-4" />
              Retour à la boutique
            </Link>
          </div>

          <p className="mt-6 text-[11.5px] text-muted">
            Conservez cette page en favori pour retrouver votre référence {order.reference}.
          </p>
        </div>
      </div>
    </div>
  );
}
