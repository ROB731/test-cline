import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-8 text-6xl">🧺</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        La boutique ou l&apos;article que tu cherches a peut-être été retiré. Vérifie le lien, ou
        demande-le directement au vendeur sur WhatsApp.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/s/chez-awa" className="btn btn-outline">
          Voir la boutique démo
        </Link>
      </div>
    </main>
  );
}
