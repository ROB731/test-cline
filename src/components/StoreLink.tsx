"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

export function StoreLink({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_APP_URL || "");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const path = `/s/${slug}`;
  const url = `${origin}${path}`;

  return (
    <div className={compact ? "" : "space-y-2"}>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted sm:text-sm">
          {origin ? url : path}
        </span>
        <CopyButton value={url} className="btn btn-outline shrink-0 px-3 py-1.5 text-xs" />
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <Link href={path} target="_blank" className="text-brand-700 hover:underline">
          Ouvrir ma vitrine ↗
        </Link>
        <span className="text-line">•</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Découvre ma boutique ${url}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="text-brand-700 hover:underline"
        >
          Partager sur WhatsApp
        </a>
      </div>
    </div>
  );
}
