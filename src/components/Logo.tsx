import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm"
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 4l9 5.5" />
          <path d="M5 10v9h14v-9" />
          <path d="M9 19v-5h6v5" />
        </svg>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Vitrine
        <span className="text-brand-500">.</span>
      </span>
    </Link>
  );
}
