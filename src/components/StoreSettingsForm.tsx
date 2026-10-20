"use client";

import { useActionState } from "react";
import { updateStore, type StoreState } from "@/lib/actions/store";

const initial: StoreState = {};

type MerchantInput = {
  storeName: string;
  slug: string;
  city: string | null;
  bio: string | null;
  whatsapp: string;
  callNumber: string | null;
  logoUrl: string | null;
};

export function StoreSettingsForm({ merchant }: { merchant: MerchantInput }) {
  const [state, action, pending] = useActionState(updateStore, initial);

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3.5 py-2.5 text-[13px] text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-success/25 bg-success/[0.07] px-3.5 py-2.5 text-[13px] text-success">
          {state.success}
        </p>
      )}

      <div className="card space-y-4 p-5">
        <h2 className="border-b border-line pb-3 text-[14px] font-medium">Identité de la boutique</h2>

        <div>
          <label className="label" htmlFor="storeName">Nom de la boutique</label>
          <input className="input" id="storeName" name="storeName" defaultValue={merchant.storeName} required />
        </div>

        <div>
          <label className="label" htmlFor="slug">Lien de la boutique</label>
          <div className="flex items-center rounded-xl border border-line bg-white focus-within:border-brand-500">
            <span className="pl-3 text-sm text-muted">/s/</span>
            <input
              className="w-full bg-transparent px-1 py-2.5 text-sm outline-none"
              id="slug"
              name="slug"
              defaultValue={merchant.slug}
              pattern="[a-z0-9-]+"
              title="Lettres minuscules, chiffres et tirets uniquement"
              required
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted">Minuscules, chiffres et tirets. Exemple : chez-awa</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="city">Ville / quartier</label>
            <input className="input" id="city" name="city" defaultValue={merchant.city ?? ""} placeholder="Cocody, Abidjan" />
          </div>
          <div>
            <label className="label" htmlFor="logoUrl">Logo (lien image)</label>
            <input className="input" id="logoUrl" name="logoUrl" defaultValue={merchant.logoUrl ?? ""} placeholder="https://…" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="bio">Présentation</label>
          <textarea
            className="input min-h-24 resize-y"
            id="bio"
            name="bio"
            defaultValue={merchant.bio ?? ""}
            placeholder="Vêtements en wax faits main, livraison à Abidjan sous 48h."
          />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="border-b border-line pb-3 text-[14px] font-medium">Contacts</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="whatsapp">Numéro WhatsApp</label>
            <input className="input" id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={merchant.whatsapp} required />
          </div>
          <div>
            <label className="label" htmlFor="callNumber">Numéro pour les appels</label>
            <input className="input" id="callNumber" name="callNumber" inputMode="tel" defaultValue={merchant.callNumber ?? ""} placeholder="Optionnel" />
          </div>
        </div>
        <p className="text-[11.5px] text-muted">
          Les commandes arrivent sur le numéro WhatsApp. Le numéro d&apos;appel s&apos;affiche sur la vitrine.
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
