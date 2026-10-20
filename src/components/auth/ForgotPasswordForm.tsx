"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { requestPasswordReset, resetPassword, type AuthState } from "@/lib/actions/auth";
import { OtpField } from "@/components/auth/OtpField";
import { DevCode } from "@/components/auth/DevCode";
import { Icon } from "@/components/icons";

const initial: AuthState = {};

export function ForgotPasswordForm() {
  const [requestState, requestAction, requesting] = useActionState(requestPasswordReset, initial);
  const [resetState, resetAction, resetting] = useActionState(resetPassword, initial);
  const [showPassword, setShowPassword] = useState(false);

  const step = resetState.step ?? requestState.step;

  if (step !== "code") {
    return (
      <form action={requestAction} className="space-y-4">
        {requestState.error && (
          <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[13px] text-danger">
            {requestState.error}
          </p>
        )}

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
          <p className="mt-1.5 text-[11.5px] text-muted">
            Le numéro utilisé lors de la création de votre boutique.
          </p>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={requesting}>
          {requesting ? "Envoi…" : "Recevoir un code"}
        </button>

        <p className="text-center text-[13px] text-muted">
          <Link href="/connexion" className="font-medium text-brand-700 underline underline-offset-2">
            Retour à la connexion
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form action={resetAction} className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5">
        <Icon name="message" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
        <p className="text-[12px] leading-relaxed text-brand-900/80">{requestState.success}</p>
      </div>

      <DevCode code={resetState.devCode ?? requestState.devCode} />

      {resetState.error && (
        <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[13px] text-danger">
          {resetState.error}
        </p>
      )}

      <input type="hidden" name="phone" value={resetState.phone ?? requestState.phone ?? ""} />

      <div>
        <label className="label" htmlFor="code">Code reçu par SMS</label>
        <OtpField autoFocus />
      </div>

      <div>
        <label className="label" htmlFor="password">Nouveau mot de passe</label>
        <div className="relative">
          <input
            className="input pr-11"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="8 caractères, lettres et chiffres"
            autoComplete="new-password"
            minLength={8}
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

      <button type="submit" className="btn btn-primary w-full" disabled={resetting}>
        {resetting ? "Enregistrement…" : "Définir le nouveau mot de passe"}
      </button>

      <p className="text-[11.5px] leading-relaxed text-muted">
        Par sécurité, toutes vos sessions ouvertes seront déconnectées.
      </p>
    </form>
  );
}
