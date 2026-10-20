"use client";

import { useFormStatus } from "react-dom";
import { ORDER_STATUSES } from "@/lib/format";
import { updateOrderStatus } from "@/lib/actions/store";

function StatusSelect({ status }: { status: string }) {
  const { pending } = useFormStatus();

  return (
    <select
      name="status"
      defaultValue={status}
      disabled={pending}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-semibold text-ink outline-none focus:border-brand-500"
      aria-label="Changer le statut de la commande"
    >
      {ORDER_STATUSES.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  return (
    <form action={updateOrderStatus} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <StatusSelect status={status} />
    </form>
  );
}
