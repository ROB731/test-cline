import Link from "next/link";
import { describeUserAgent, listSessions, requireMerchant } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/lib/actions/auth";
import { DeleteAccountForm, PasswordForm, PhoneForm, ProfileForm } from "@/components/auth/AccountForms";
import { Icon, type IconName } from "@/components/icons";

export const dynamic = "force-dynamic";

function Section({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex gap-3">
          <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div>
            <h2 className="text-[14px] font-medium">{title}</h2>
            {description && <p className="mt-0.5 text-[12px] text-muted">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function ComptePage() {
  const merchant = await requireMerchant("/tableau-de-bord/compte");
  const sessions = await listSessions(merchant.id);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="display text-[30px] leading-tight">Compte</h1>
        <p className="mt-1 text-[13px] text-muted">
          Vos informations personnelles, la sécurité de l&apos;accès et vos appareils connectés.
        </p>
      </div>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="display flex h-12 w-12 items-center justify-center rounded bg-brand-100 text-lg text-brand-800">
            {merchant.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="text-[15px] font-medium">{merchant.name}</p>
            <p className="mt-0.5 text-[12px] text-muted">
              {merchant.storeName} · membre depuis {formatDate(merchant.createdAt)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px]">{merchant.phone}</span>
              {merchant.phoneVerified ? (
                <span className="badge border-success/25 bg-success/[0.07] text-success">
                  <Icon name="check" className="h-3 w-3" strokeWidth={2.6} />
                  Vérifié
                </span>
              ) : (
                <Link
                  href="/verifier-telephone"
                  className="badge border-accent-400/50 bg-accent-100 text-accent-600 hover:underline"
                >
                  <Icon name="alert" className="h-3 w-3" />
                  Numéro non vérifié
                </Link>
              )}
            </div>
          </div>
        </div>
        <Link href={`/s/${merchant.slug}`} target="_blank" className="btn btn-outline btn-sm shrink-0">
          <Icon name="external" className="h-3.5 w-3.5" />
          Voir ma vitrine
        </Link>
      </section>

      <Section icon="user" title="Profil" description="Votre nom et vos coordonnées de contact.">
        <ProfileForm
          merchant={{ name: merchant.name, city: merchant.city, email: merchant.email }}
        />
      </Section>

      <Section
        icon="lock"
        title="Mot de passe"
        description="Changez-le régulièrement et ne le partagez jamais."
      >
        <PasswordForm />
      </Section>

      <Section
        icon="phone"
        title="Numéro de téléphone"
        description="C'est votre identifiant de connexion et le numéro qui reçoit les commandes."
      >
        <PhoneForm phone={merchant.phone} />
      </Section>

      <Section
        icon="shield"
        title="Sessions actives"
        description="Appareils connectés à votre compte."
        action={
          sessions.length > 1 ? (
            <form action={revokeOtherSessionsAction}>
              <button type="submit" className="btn btn-outline btn-sm">
                Déconnecter les autres appareils
              </button>
            </form>
          ) : null
        }
      >
        <ul className="divide-y divide-line">
          {sessions.map((session) => (
            <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <p className="text-[13px] font-medium">
                  {describeUserAgent(session.userAgent)}
                  {session.current && (
                    <span className="ml-2 badge border-brand-200 bg-brand-50 text-brand-800">
                      Cet appareil
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {session.ip ? `${session.ip} · ` : ""}
                  dernière activité {formatDate(session.lastSeenAt)} · expire le{" "}
                  {formatDate(session.expiresAt)}
                </p>
              </div>
              {!session.current && (
                <form action={revokeSessionAction}>
                  <input type="hidden" name="id" value={session.id} />
                  <button type="submit" className="btn btn-ghost btn-sm text-muted hover:text-danger">
                    Déconnecter
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        icon="alert"
        title="Zone sensible"
        description="Suppression définitive du compte et de son contenu."
      >
        <DeleteAccountForm />
      </Section>
    </div>
  );
}
