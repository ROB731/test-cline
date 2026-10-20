import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const display = localFont({
  src: "./fonts/InstrumentSerif-Regular.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Vitrine — la boutique de ceux qui vendent sur WhatsApp",
  description:
    "Vitrine donne aux vendeurs ivoiriens une boutique en ligne à leur nom : un lien à partager, un catalogue soigné et des commandes claires sur WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#1b4438",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
