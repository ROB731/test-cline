import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitrine — Ta boutique WhatsApp, enfin rangée",
  description:
    "Crée la vitrine de ta boutique en 5 minutes, partage un seul lien et reçois des commandes claires sur WhatsApp. Pensé pour les vendeurs ivoiriens.",
};

export const viewport: Viewport = {
  themeColor: "#0d6354",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
