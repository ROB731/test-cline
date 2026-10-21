"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cartTotal, type CartItem } from "@/lib/cart";
import { formatFCFA, whatsappLink } from "@/lib/format";
import { createPublicOrder, type PublicOrderState } from "@/lib/actions/orders";
import { Icon, IconWhatsApp } from "@/components/icons";

const initial: PublicOrderState = {};

export function CartSheet({
  open,
  onClose,
  slug,
  storeName,
  whatsapp,
  items,
  onQuantity,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  storeName: string;
  whatsapp: string;
  items: CartItem[];
  onQuantity: (productId: string, quantity: number) => void;
  onClear: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"panier" | "infos">("panier");
  const [customer, setCustomer] = useState({ name: "", phone: "", note: "" });
  const [state, action, pending] = useActionState(createPublicOrder, initial);
  const total = cartTotal(items);

  const payload = useMemo(
    () => JSON.stringify(items.map((item) => ({ productId: item.productId, quantity: item.quantity }))),
    [items],
  );

  useEffect(() => {
    if (!open) setStep("panier");
  }, [open]);

  useEffect(() => {
    if (!state.order) return;

    const name = customer.name;
    const phone = customer.phone;
    const note = customer.note;

    const message = [
      `Bonjour ${storeName},`,
      `Je viens de passer la commande ${state.order.reference} sur votre vitrine.`,
      "",
      ...items.map((item) => `• ${item.quantity} × ${item.name} — ${formatFCFA(item.price * item.quantity)}`),
      `Total : ${formatFCFA(state.order.total)}`,
      "",
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
      note ? `Livraison : ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(whatsapp, message), "_blank", "noopener");
    onClear();
    onClose();
    router.push(`/s/${slug}/commande/${state.order.reference}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.order]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer le panier"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[var(--shop-radius)] bg-[var(--shop-surface)] text-[var(--shop-ink)] shadow-xl sm:rounded-[var(--shop-radius)]">
        <div className="flex items-center justify-between border-b border-[var(--shop-line)] px-5 py-4">
          <h2 className="font-bold">
            {step === "panier" ? "Votre panier" : "Vos coordonnées"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
            aria-label="Fermer"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 && step === "panier" ? (
            <p className="py-10 text-center text-sm text-[var(--shop-muted)]">Ton panier est vide.</p>
          ) : step === "panier" ? (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-16 w-16 rounded-[var(--shop-radius)] border border-[var(--shop-line)] object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-[var(--shop-radius)] bg-[var(--shop-hero)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-[var(--shop-muted)]">{formatFCFA(item.price)}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-[var(--shop-radius)] border border-[var(--shop-line)]">
                      <button
                        type="button"
                        onClick={() => onQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 text-[var(--shop-muted)] hover:text-[var(--shop-ink)]"
                        aria-label="Diminuer"
                      >
                        <Icon name="minus" className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-4 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-2 py-1 text-[var(--shop-muted)] hover:text-[var(--shop-ink)] disabled:opacity-30"
                        aria-label="Augmenter"
                      >
                        <Icon name="plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold">{formatFCFA(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <form id="checkout-form" action={action} className="space-y-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="items" value={payload} />

              {state.error && (
                <p className="rounded-[var(--shop-radius)] border border-danger-400/40 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
                  {state.error}
                </p>
              )}

              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--shop-ink)]" htmlFor="customerName">Ton nom *</label>
                <input
                  className="shop-input"
                  id="customerName"
                  name="customerName"
                  required
                  placeholder="Awa Koné"
                  value={customer.name}
                  onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--shop-ink)]" htmlFor="customerPhone">Ton numéro WhatsApp *</label>
                <input
                  className="shop-input"
                  id="customerPhone"
                  name="customerPhone"
                  inputMode="tel"
                  required
                  placeholder="07 00 00 00 00"
                  value={customer.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--shop-ink)]" htmlFor="deliveryNote">Livraison</label>
                <input
                  className="shop-input"
                  id="deliveryNote"
                  name="deliveryNote"
                  placeholder="Quartier, repère, ville…"
                  value={customer.note}
                  onChange={(event) => setCustomer({ ...customer, note: event.target.value })}
                />
              </div>

              <p className="rounded-[var(--shop-radius)] border border-[var(--shop-line)] px-3 py-2 text-[11.5px] leading-relaxed text-[var(--shop-muted)]">
                En validant, ta commande est enregistrée chez le vendeur et un message WhatsApp
                pré-rempli s&apos;ouvre pour confirmer.
              </p>

              <button type="submit" className="btn btn-wa w-full rounded-[var(--shop-radius)]" disabled={pending}>
                <IconWhatsApp className="h-4 w-4" />
                {pending ? "Envoi…" : "Valider et envoyer sur WhatsApp"}
              </button>
            </form>
          )}
        </div>

        <div className="border-t border-[var(--shop-line)] px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--shop-muted)]">Total</span>
            <span className="text-[17px] font-medium">{formatFCFA(total)}</span>
          </div>
          {step === "panier" && items.length > 0 && (
            <button type="button" onClick={() => setStep("infos")} className="shop-btn mt-3 w-full">
              Continuer
            </button>
          )}
          {step === "infos" && (
            <button type="button" onClick={() => setStep("panier")} className="mt-3 w-full text-xs font-medium text-[var(--shop-muted)]">
              ← Modifier le panier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
