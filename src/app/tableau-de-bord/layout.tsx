import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { Logo } from "@/components/Logo";
import { DashboardBottomNav, DashboardNav } from "@/components/DashboardNav";
import { signOut } from "@/lib/actions/auth";
import { IconLogout } from "@/components/icons";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const merchant = await requireMerchant();
  const plan = getPlan(merchant.plan);

  return (
    <div className="min-h-dvh bg-paper md:flex">
      {/* --------- Sidebar desktop --------- */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-5 md:flex">
        <div className="px-1">
          <Logo />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-paper p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
              {merchant.storeName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{merchant.storeName}</p>
              <p className="truncate text-xs text-muted">{merchant.city || "Côte d'Ivoire"}</p>
            </div>
          </div>
          <span className="badge mt-2 border-brand-200 bg-brand-50 text-brand-800">
            Plan {plan.label}
          </span>
        </div>

        <div className="mt-5">
          <DashboardNav />
        </div>

        <div className="mt-auto space-y-2 pt-4">
          <Link
            href={`/s/${merchant.slug}`}
            target="_blank"
            className="btn btn-outline w-full text-sm"
          >
            Voir ma vitrine ↗
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-rose-50 hover:text-rose-700">
              <IconLogout className="h-4 w-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* --------- Contenu --------- */}
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <span className="badge border-brand-200 bg-brand-50 text-brand-800">{plan.label}</span>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-9">{children}</main>
      </div>

      <DashboardBottomNav />
    </div>
  );
}
