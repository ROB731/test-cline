"use client";

import { useActionState, useState } from "react";
import { confirmPhoneCode, sendPhoneCode, type AuthState } from "@/lib/actions/auth";
import { OtpField } from "@/components/auth/OtpField";
import { DevCode } from "@/components/auth/DevCode";
import { Icon } from "@/components/icons";

const initial: AuthState = {};

export function PhoneVerification({ phone, masked }: { phone: string; masked: string }) {
  const [sendState, sendAction, sending] = useActionState(sendPhoneCode, initial);
  const [verifyState, verifyAction, verifying] = useActionState(confirmPhoneCode, initial);
  const [resendReady, setResendReady] = useState(true);

  const started = Boolean(sendState.success) || Boolean(verifyState.step);

  function cooldown() {
    setResendReady(false);
    setTimeout(() => setResendReady(true), 30000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-line bg-paper px-3.5 py-3">
        <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
        <div>
          <p className="text-[13px] font-medium">{masked}</p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            Nous vérifions ce numéro pour sécuriser votre compte et vos commandes.
          </p>
        </div>
      </div>

      {!started ? (
        <form action={sendAction} className="space-y-3" onSubmit={cooldown}>
          {sendState.error && (
            <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[13px] text-danger">
              {sendState.error}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={sending}>
            {sending ? "Envoi du code…" : "Recevoir mon code de vérification"}
          </button>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4" onSubmit={cooldown}>
          {verifyState.error && (
            <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[13px] text-danger">
              {verifyState.error}
            </p>
          )}

          <DevCode code={verifyState.devCode ?? sendState.devCode} />

          <div>
            <label className="label" htmlFor="code">Code à 6 chiffres</label>
            <OtpField autoFocus />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={verifying}>
            {verifying ? "Vérification…" : "Vérifier mon numéro"}
          </button>
        </form>
      )}

      {started && (
        <form action={sendAction} onSubmit={cooldown}>
          <button type="submit" disabled={sending || !resendReady} className="btn btn-ghost w-full text-[12px]">
            {!resendReady ? "Patientez avant de renvoyer" : sending ? "Envoi…" : "Renvoyer le code"}
          </button>
        </form>
      )}

      <p className="text-[11.5px] leading-relaxed text-muted">
        Vous ne recevez rien ? Vérifiez que le numéro {phone} est bien celui de votre téléphone, ou
        modifiez-le depuis la page Compte.
      </p>
    </div>
  );
}
