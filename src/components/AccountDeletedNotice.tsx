"use client";

import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";

export function AccountDeletedNotice() {
  const params = useSearchParams();
  if (params.get("compte") !== "supprime") return null;

  return (
    <div className="border-b border-line bg-brand-50">
      <div className="container-page flex items-center gap-2.5 py-2.5 text-[12.5px] text-brand-900">
        <Icon name="check" className="h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.2} />
        Votre compte et son contenu ont été supprimés. Merci d&apos;avoir utilisé Vitrine.
      </div>
    </div>
  );
}
