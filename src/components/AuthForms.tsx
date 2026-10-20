"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/icons";

const initial: AuthState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[13px] text-danger">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function FieldNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[13px] text-brand-900">
      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.2} />
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
        <label className="label" htmlFor="storeName">Nom de la boutique</label>
        <input className="input" id="storeName" name="storeName" placeholder="Chez Awa" required />
        <p className="mt-1.5 text-[11.5px] text-muted">Il apparaîtra en haut de votre vitrine.</p>
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
          <p className="mt-1.5 text-[11.5px] text-muted">Ce numéro sert à vous connecter.</p>
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
          placeholder="8 caractères, lettres et chiffres"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted">
        <input type="checkbox" name="conditions" className="mt-0.5 h-4 w-4 accent-brand-800" required />
        <span>
          J&apos;accepte les{" "}
          <Link href="/conditions" className="font-medium text-brand-700 underline underline-offset-2">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="font-medium text-brand-700 underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Création du compte…" : "Créer ma boutique"}
      </button>

      <p className="text-center text-[13px] text-muted">
        Vous avez déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-brand-700 underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FieldError message={state.error} />
      <FieldNotice message={notice} />

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
        <div className="flex items-center justify-between">
          <label className="label mb-0" htmlFor="password">Mot de passe</label>
          <Link href="/mot-de-passe-oublie" className="text-[11.5px] font-medium text-brand-700 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative mt-1.5">
          <input
            className="input pr-11"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-ink"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <Icon name="eye" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-[12.5px] text-muted">
        <input type="checkbox" name="remember" className="h-4 w-4 accent-brand-800" />
        Rester connecté sur cet appareil
      </label>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center text-[13px] text-muted">
        Pas encore de boutique ?{" "}
        <Link href="/inscription" className="font-medium text-brand-700 underline underline-offset-2">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
