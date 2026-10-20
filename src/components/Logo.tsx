import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Vitrine — accueil">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-[5px] ${
          light ? "bg-white text-brand-900" : "bg-brand-900 text-white"
        }`}
        aria-hidden
      >
        <span className="display text-[19px] leading-none">V</span>
      </span>
      <span
        className={`display text-[22px] leading-none tracking-tight ${
          light ? "text-white" : "text-ink"
        }`}
      >
        Vitrine
      </span>
    </Link>
  );
}
