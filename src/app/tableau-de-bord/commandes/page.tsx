import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatFCFA, ORDER_STATUSES, statusMeta, whatsappLink } from "@/lib/format";
import { parseItems } from "@/lib/types";
import { OrderStatusForm } from "@/components/OrderStatusForm";
import { IconWhatsApp } from "@/components/icons";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Commandes</h1>
        <p className="mt-1 text-sm text-muted">
          Chaque commande reçue depuis ta vitrine arrive ici, avec le récapitulatif complet.
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((filter) => (
          <Link
            key={filter.id}
            href={
              filter.id === "TOUTES"
                ? "/tableau-de-bord/commandes"
                : `/tableau-de-bord/commandes?statut=${filter.id}`
            }
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active === filter.id
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line bg-white text-muted hover:border-brand-300 hover:text-ink"
            }`}
          >
            {filter.label} ({filter.count})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-4xl">🧾</p>
          <h2 className="mt-3 text-lg font-bold">Aucune commande ici</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Dès qu&apos;un client valide son panier sur ta vitrine, la commande apparaît dans cette
            liste.
          </p>
          <Link href={`/s/${merchant.slug}`} target="_blank" className="btn btn-outline mt-5">
            Voir ma vitrine ↗
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
    ...items.map((item) => `- ${item.quantity} × ${item.name} (${formatFCFA(item.price)})`),
    `Total : ${formatFCFA(order.total)}`,
  ].join("\n");

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-muted">{order.reference}</span>
          <span className={`badge ${meta.tone}`}>{meta.label}</span>
        </div>
        <OrderStatusForm id={order.id} status={order.status} />
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-bold">{order.customerName}</p>
          <p className="text-xs text-muted">
            {order.customerPhone} · {formatDate(order.createdAt)}
          </p>
          {order.deliveryNote && (
            <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-xs text-muted">
              📍 {order.deliveryNote}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={whatsappLink(order.customerPhone, recap)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-wa px-3 py-1.5 text-xs"
            >
              <IconWhatsApp className="h-3.5 w-3.5" />
              Contacter
            </a>
            <a
              href={`tel:+${order.customerPhone.replace(/\D/g, "")}`}
              className="btn btn-outline px-3 py-1.5 text-xs"
            >
              Appeler
            </a>
          </div>
        </div>

        <ul className="space-y-1.5 rounded-xl bg-paper p-3 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted">
                {item.quantity} × {item.name}
              </span>
              <span className="shrink-0 font-semibold">
                {formatFCFA(item.price * item.quantity)}
              </span>
            </li>
          ))}
          <li className="flex justify-between border-t border-line pt-1.5 font-bold">
            <span>Total</span>
            <span>{formatFCFA(order.total)}</span>
          </li>
        </ul>
      </div>
    </article>
  );
}
