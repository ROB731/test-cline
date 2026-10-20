import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-mono text-[11px] tracking-[0.18em] text-muted">ERREUR 404</p>
      <h1 className="display mt-3 text-[32px] leading-tight">Cette page n&apos;existe pas</h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
        La boutique ou l&apos;article recherché a peut-être été retiré. Vérifiez le lien, ou
        demandez-le directement au vendeur sur WhatsApp.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Accueil
        </Link>
        <Link href="/s/chez-awa" className="btn btn-outline">
          Voir la boutique démo
        </Link>
      </div>
    </main>
  );
}
