import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { Logo } from "@/components/Logo";
import { DashboardBottomNav, DashboardNav } from "@/components/DashboardNav";
import { signOut } from "@/lib/actions/auth";
import { Icon } from "@/components/icons";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const merchant = await requireMerchant();
  const plan = getPlan(merchant.plan);

  return (
    <div className="min-h-dvh bg-paper md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-white px-4 py-5 md:flex">
        <div className="px-1">
          <Logo />
        </div>

        <div className="mt-7 flex items-center gap-2.5 border-y border-line py-4">
          <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded bg-brand-100 text-sm text-brand-800">
            {merchant.storeName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{merchant.storeName}</p>
            <p className="truncate text-[11px] text-muted">{merchant.city || "Côte d'Ivoire"}</p>
          </div>
        </div>

        <div className="mt-4">
          <DashboardNav />
        </div>

        <div className="mt-auto space-y-1 pt-4">
          <div className="mb-2 flex items-center justify-between rounded-md bg-paper px-2.5 py-2">
            <span className="text-[11px] text-muted">Formule</span>
            <span className="text-[11px] font-medium text-brand-800">{plan.label}</span>
          </div>
          <Link
            href={`/s/${merchant.slug}`}
            target="_blank"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-soft hover:bg-paper"
          >
            <Icon name="external" className="h-4 w-4 text-muted" />
            Voir ma vitrine
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-soft hover:bg-paper hover:text-danger"
            >
              <Icon name="logout" className="h-4 w-4 text-muted" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <span className="badge bg-white text-brand-800">{plan.label}</span>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-7 md:py-10">{children}</main>
      </div>

      <DashboardBottomNav />
    </div>
  );
}
