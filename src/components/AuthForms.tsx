"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/icons";

const initial: AuthState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-sm text-danger">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);

  return (
    <form action={action} className="space-y-4">
      <FieldError message={state.error} />

      <div>
        <label className="label" htmlFor="storeName">
          Nom de la boutique
        </label>
        <input className="input" id="storeName" name="storeName" placeholder="Chez Awa" required />
        <p className="mt-1.5 text-xs text-muted">Il apparaîtra en haut de votre vitrine.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Votre nom</label>
          <input className="input" id="name" name="name" placeholder="Awa Koné" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="city">Ville</label>
          <input className="input" id="city" name="city" placeholder="Abidjan" autoComplete="address-level2" />
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
          <input className="input" id="whatsapp" name="whatsapp" inputMode="tel" placeholder="Si différent" />
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
        {pending ? "Création du compte…" : "Créer ma boutique"}
      </button>

      <p className="text-center text-sm text-muted">
        Vous avez déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-brand-700 underline underline-offset-2">
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
      <FieldError message={state.error} />
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
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-muted">
        Pas encore de boutique ?{" "}
        <Link href="/inscription" className="font-medium text-brand-700 underline underline-offset-2">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
