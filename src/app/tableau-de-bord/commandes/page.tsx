import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatFCFA, ORDER_STATUSES, statusMeta, whatsappLink } from "@/lib/format";
import { parseItems } from "@/lib/types";
import { OrderStatusForm } from "@/components/OrderStatusForm";
import { Icon, IconWhatsApp } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const merchant = await requireMerchant();
  const { statut } = await searchParams;
  const active = ORDER_STATUSES.some((s) => s.id === statut) ? statut : "TOUTES";

  const [orders, grouped] = await Promise.all([
    prisma.order.findMany({
      where: {
        merchantId: merchant.id,
        ...(active && active !== "TOUTES" ? { status: active } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { merchantId: merchant.id },
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

  const filters = [
    { id: "TOUTES", label: "Toutes", count: total },
    ...ORDER_STATUSES.map((status) => ({
      id: status.id as string,
      label: status.label,
      count: counts.get(status.id) ?? 0,
    })),
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="display text-[30px] leading-tight">Commandes</h1>
        <p className="mt-1 text-[13px] text-muted">
          Chaque commande passée sur votre vitrine arrive ici avec son récapitulatif complet.
        </p>
      </div>

      <div className="-mx-1 flex gap-5 overflow-x-auto border-b border-line px-1">
        {filters.map((filter) => (
          <Link
            key={filter.id}
            href={
              filter.id === "TOUTES"
                ? "/tableau-de-bord/commandes"
                : `/tableau-de-bord/commandes?statut=${filter.id}`
            }
            className={`-mb-px shrink-0 border-b-2 pb-2.5 text-[13px] transition ${
              active === filter.id
                ? "border-brand-800 font-medium text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 text-[11px] text-muted">{filter.count}</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <Icon name="bag" className="mx-auto h-7 w-7 text-line-strong" />
          <h2 className="mt-4 text-[15px] font-medium">Aucune commande dans cette catégorie</h2>
          <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-muted">
            Dès qu&apos;un client valide son panier sur votre vitrine, la commande apparaît dans
            cette liste.
          </p>
          <Link href={`/s/${merchant.slug}`} target="_blank" className="btn btn-outline btn-sm mt-5">
            <Icon name="external" className="h-3.5 w-3.5" />
            Voir ma vitrine
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} storeName={merchant.storeName} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  storeName,
}: {
  order: {
    id: string;
    reference: string;
    customerName: string;
    customerPhone: string;
    deliveryNote: string | null;
    items: string;
    total: number;
    status: string;
    createdAt: Date;
  };
  storeName: string;
}) {
  const items = parseItems(order.items);
  const meta = statusMeta(order.status);
  const recap = [
    `Bonjour ${order.customerName},`,
    `Votre commande ${order.reference} chez ${storeName} :`,
    ...items.map((item) => `- ${item.quantity} x ${item.name} (${formatFCFA(item.price)})`),
    `Total : ${formatFCFA(order.total)}`,
  ].join("\n");

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-medium">{order.reference}</span>
          <span className={`badge ${meta.tone}`}>{meta.label}</span>
        </div>
        <OrderStatusForm id={order.id} status={order.status} />
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="text-[14px] font-medium">{order.customerName}</p>
          <p className="mt-0.5 text-[12px] text-muted">
            {order.customerPhone} · {formatDate(order.createdAt)}
          </p>

          {order.deliveryNote && (
            <p className="mt-2.5 flex gap-2 text-[12px] leading-relaxed text-muted">
              <Icon name="truck" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {order.deliveryNote}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={whatsappLink(order.customerPhone, recap)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wa btn-sm"
            >
              <IconWhatsApp className="h-3.5 w-3.5" />
              Contacter
            </a>
            <a href={`tel:+${order.customerPhone.replace(/\D/g, "")}`} className="btn btn-outline btn-sm">
              <Icon name="phone" className="h-3.5 w-3.5" />
              Appeler
            </a>
          </div>
        </div>

        <ul className="space-y-1.5 rounded-lg bg-paper p-3.5 text-[13px]">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted">
                {item.quantity} × {item.name}
              </span>
              <span className="shrink-0 font-medium">
                {formatFCFA(item.price * item.quantity)}
              </span>
            </li>
          ))}
          <li className="mt-1 flex justify-between border-t border-line pt-2 font-medium">
            <span>Total</span>
            <span>{formatFCFA(order.total)}</span>
          </li>
        </ul>
      </div>
    </article>
  );
}
