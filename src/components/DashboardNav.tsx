"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBag, IconBox, IconHome, IconSpark, IconStore } from "@/components/icons";

const items = [
  { href: "/tableau-de-bord", label: "Accueil", Icon: IconHome },
  { href: "/tableau-de-bord/produits", label: "Produits", Icon: IconBox },
  { href: "/tableau-de-bord/commandes", label: "Commandes", Icon: IconBag },
  { href: "/tableau-de-bord/boutique", label: "Boutique", Icon: IconStore },
  { href: "/tableau-de-bord/abonnement", label: "Abonnement", Icon: IconSpark },
];

function isActive(pathname: string, href: string) {
  if (href === "/tableau-de-bord") return pathname === href;
  return pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-brand-50 text-brand-800"
                : "text-muted hover:bg-brand-50/60 hover:text-ink"
            }`}
          >
            <Icon className={`h-[18px] w-[18px] ${active ? "text-brand-700" : "text-muted"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
                active ? "text-brand-700" : "text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
