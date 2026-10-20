import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/icons";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-white">
      <header className="border-b border-line">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink">
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            Accueil
          </Link>
        </div>
      </header>

      <article className="container-page max-w-2xl py-12 md:py-16">
        <p className="eyebrow">Document légal</p>
        <h1 className="display mt-3 text-[34px] leading-tight">{title}</h1>
        <p className="mt-2 text-[12px] text-muted">Dernière mise à jour : {updated}</p>
        <div className="mt-8 space-y-6 border-t border-line pt-8 text-[13.5px] leading-relaxed text-ink-soft">
          {children}
        </div>
      </article>
    </main>
  );
}
