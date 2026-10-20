"use client";

import { useActionState, useState } from "react";
import {
  changePassword,
  confirmPhoneChange,
  deleteAccount,
  requestPhoneChange,
  updateProfile,
  type AuthState,
} from "@/lib/actions/auth";
import { OtpField } from "@/components/auth/OtpField";
import { DevCode } from "@/components/auth/DevCode";
import { Icon } from "@/components/icons";

const initial: AuthState = {};

function Feedback({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[12.5px] text-danger">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-success/25 bg-success/[0.07] px-3 py-2 text-[12.5px] text-success">
        <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
        {state.success}
      </p>
    );
  }
  return null;
}

function PasswordInput({ id, name, label }: { id: string; name: string; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          className="input pr-11"
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
          required
        />
        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-ink"
          aria-label={show ? "Masquer" : "Afficher"}
        >
          <Icon name="eye" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ProfileForm({
  merchant,
}: {
  merchant: { name: string; city: string | null; email: string | null };
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="space-y-4 p-5">
      <Feedback state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nom complet</label>
          <input className="input" id="name" name="name" defaultValue={merchant.name} required />
        </div>
        <div>
          <label className="label" htmlFor="city">Ville</label>
          <input className="input" id="city" name="city" defaultValue={merchant.city ?? ""} placeholder="Abidjan" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="email">Adresse e-mail <span className="font-normal text-muted">(facultatif)</span></label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          defaultValue={merchant.email ?? ""}
          placeholder="awa@exemple.ci"
        />
        <p className="mt-1.5 text-[11.5px] text-muted">Utilisée uniquement pour vous contacter.</p>
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le profil"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);

  return (
    <form action={action} className="space-y-4 p-5">
      <Feedback state={state} />
      <PasswordInput id="currentPassword" name="currentPassword" label="Mot de passe actuel" />
      <PasswordInput id="newPassword" name="newPassword" label="Nouveau mot de passe" />
      <p className="text-[11.5px] leading-relaxed text-muted">
        8 caractères minimum, avec au moins une lettre et un chiffre. Les autres appareils seront
        déconnectés.
      </p>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? "Modification…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}

export function PhoneForm({ phone }: { phone: string }) {
  const [requestState, requestAction, requesting] = useActionState(requestPhoneChange, initial);
  const [confirmState, confirmAction, confirming] = useActionState(confirmPhoneChange, initial);
  const [showPassword, setShowPassword] = useState(false);

  const pendingPhone = confirmState.pendingPhone ?? requestState.pendingPhone;

  if (pendingPhone) {
    return (
      <form action={confirmAction} className="space-y-4 p-5">
        <Feedback state={confirmState} />
        <input type="hidden" name="pendingPhone" value={pendingPhone} />
        <DevCode code={confirmState.devCode ?? requestState.devCode} />
        <div>
          <label className="label" htmlFor="phoneChangeCode">Code envoyé au {pendingPhone}</label>
          <OtpField name="code" autoFocus />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={confirming}>
          {confirming ? "Vérification…" : "Confirmer le nouveau numéro"}
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-4 p-5">
      <Feedback state={requestState} />
      <div>
        <label className="label" htmlFor="newPhone">Nouveau numéro</label>
        <input
          className="input"
          id="newPhone"
          name="newPhone"
          inputMode="tel"
          placeholder="07 00 00 00 00"
          required
        />
        <p className="mt-1.5 text-[11.5px] text-muted">
          Il deviendra votre identifiant de connexion après vérification par SMS.
        </p>
      </div>
      <div>
        <label className="label" htmlFor="phonePassword">Mot de passe actuel</label>
        <div className="relative">
          <input
            className="input pr-11"
            id="phonePassword"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-ink"
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            <Icon name="eye" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <button type="submit" className="btn btn-outline btn-sm" disabled={requesting}>
        {requesting ? "Envoi du code…" : "Recevoir un code sur le nouveau numéro"}
      </button>
      <p className="text-[11.5px] text-muted">Numéro actuel : {phone}</p>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, initial);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-[13px] font-medium">Supprimer définitivement mon compte</p>
          <p className="mt-0.5 text-[12px] text-muted">
            La boutique, les produits et l&apos;historique des commandes seront effacés.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm shrink-0 text-danger" onClick={() => setOpen(true)}>
          Supprimer mon compte
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 p-5">
      <div className="flex gap-2.5 rounded-lg border border-danger/25 bg-danger/[0.05] px-3 py-2.5">
        <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p className="text-[12px] leading-relaxed text-danger">
          Cette action est irréversible. Le lien de votre boutique cessera de fonctionner
          immédiatement.
        </p>
      </div>

      <Feedback state={state} />

      <PasswordInput id="deletePassword" name="password" label="Mot de passe" />

      <div>
        <label className="label" htmlFor="confirmation">
          Tapez SUPPRIMER pour confirmer
        </label>
        <input
          className="input font-mono uppercase"
          id="confirmation"
          name="confirmation"
          placeholder="SUPPRIMER"
          autoComplete="off"
          required
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-sm bg-danger text-white hover:bg-danger/90" disabled={pending}>
          {pending ? "Suppression…" : "Supprimer définitivement"}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)} disabled={pending}>
          Annuler
        </button>
      </div>
    </form>
  );
}
