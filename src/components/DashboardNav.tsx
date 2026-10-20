"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/tableau-de-bord", label: "Vue d'ensemble", icon: "home" },
  { href: "/tableau-de-bord/produits", label: "Produits", icon: "box" },
  { href: "/tableau-de-bord/commandes", label: "Commandes", icon: "bag" },
  { href: "/tableau-de-bord/boutique", label: "Boutique", icon: "store" },
  { href: "/tableau-de-bord/abonnement", label: "Abonnement", icon: "sliders" },
];

function isActive(pathname: string, href: string) {
  if (href === "/tableau-de-bord") return pathname === href;
  return pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {items.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition ${
              active
                ? "bg-brand-50 font-medium text-brand-900"
                : "text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            <Icon name={icon} className={`h-4 w-4 ${active ? "text-brand-700" : "text-muted"}`} />
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                active ? "text-brand-800" : "text-muted"
              }`}
            >
              <Icon name={icon} className="h-[18px] w-[18px]" />
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
