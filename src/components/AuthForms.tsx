"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";

const initial: AuthState = {};

function ErrorBox({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
      {message}
    </p>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);

  return (
    <form action={action} className="space-y-4">
      <ErrorBox message={state.error} />
      <div>
        <label className="label" htmlFor="storeName">Nom de ta boutique</label>
        <input
          className="input"
          id="storeName"
          name="storeName"
          placeholder="Chez Awa"
          autoComplete="organization"
          required
        />
        <p className="mt-1 text-xs text-muted">Ce nom apparaîtra en haut de ta vitrine.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Ton nom</label>
          <input className="input" id="name" name="name" placeholder="Awa Koné" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="city">Ville / quartier</label>
          <input className="input" id="city" name="city" placeholder="Cocody, Abidjan" autoComplete="address-level2" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Téléphone</label>
          <input
            className="input"
            id="phone"
            name="phone"
            inputMode="tel"
            placeholder="07 00 00 00 00"
            autoComplete="tel"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">Numéro WhatsApp</label>
          <input
            className="input"
            id="whatsapp"
            name="whatsapp"
            inputMode="tel"
            placeholder="Identique au téléphone"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          placeholder="6 caractères minimum"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Création en cours…" : "Créer ma boutique gratuitement"}
      </button>

      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="space-y-4">
      <ErrorBox message={state.error} />
      <div>
        <label className="label" htmlFor="phone">Numéro de téléphone</label>
        <input
          className="input"
          id="phone"
          name="phone"
          inputMode="tel"
          placeholder="07 00 00 00 00"
          autoComplete="tel"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-muted">
        Pas encore de boutique ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
