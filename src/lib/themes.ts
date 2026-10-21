import type { CSSProperties } from "react";

export type ThemeId = "classique" | "editorial" | "marche" | "nuit";

export type Theme = {
  id: ThemeId;
  label: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    ink: string;
    muted: string;
    line: string;
    accent: string;
    accentInk: string;
    hero: string;
  };
  radius: string;
  heading: "serif" | "sans";
  swatches: [string, string, string];
};

export const THEMES: Theme[] = [
  {
    id: "classique",
    label: "Classique",
    description: "Fond papier, vert profond, titres en serif. Le style par défaut, intemporel.",
    colors: {
      bg: "#f6f5f2",
      surface: "#ffffff",
      ink: "#111715",
      muted: "#646f6a",
      line: "#e3e1da",
      accent: "#1b4438",
      accentInk: "#ffffff",
      hero: "#f1efe9",
    },
    radius: "0.625rem",
    heading: "serif",
    swatches: ["#f6f5f2", "#1b4438", "#111715"],
  },
  {
    id: "editorial",
    label: "Éditorial",
    description: "Ivoire, filets fins, angles nets. Une présentation façon magazine.",
    colors: {
      bg: "#fbf9f4",
      surface: "#fffdf9",
      ink: "#1a1a18",
      muted: "#6f6a60",
      line: "#ddd6c8",
      accent: "#1a1a18",
      accentInk: "#fffdf9",
      hero: "#f4f0e6",
    },
    radius: "0rem",
    heading: "serif",
    swatches: ["#fbf9f4", "#1a1a18", "#ddd6c8"],
  },
  {
    id: "marche",
    label: "Marché",
    description: "Sable chaud, terre cuite, formes arrondies. Chaleureux et direct.",
    colors: {
      bg: "#fdf3e7",
      surface: "#ffffff",
      ink: "#2a1a12",
      muted: "#7a6355",
      line: "#ecd9c3",
      accent: "#b4532a",
      accentInk: "#ffffff",
      hero: "#f8e7d3",
    },
    radius: "0.9rem",
    heading: "sans",
    swatches: ["#fdf3e7", "#b4532a", "#2a1a12"],
  },
  {
    id: "nuit",
    label: "Nuit",
    description: "Fond anthracite, accents dorés, pièces mises en valeur. Idéal pour les bijoux.",
    colors: {
      bg: "#0f1211",
      surface: "#171b19",
      ink: "#f3f1ea",
      muted: "#a3a49c",
      line: "#2a302d",
      accent: "#cfae6a",
      accentInk: "#171b19",
      hero: "#141817",
    },
    radius: "0.375rem",
    heading: "serif",
    swatches: ["#0f1211", "#cfae6a", "#f3f1ea"],
  },
];

export function getTheme(id?: string | null): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

/** Variables CSS appliquées sur le conteneur de la vitrine. */
export function themeStyle(theme: Theme): CSSProperties {
  return {
    "--shop-bg": theme.colors.bg,
    "--shop-surface": theme.colors.surface,
    "--shop-ink": theme.colors.ink,
    "--shop-muted": theme.colors.muted,
    "--shop-line": theme.colors.line,
    "--shop-accent": theme.colors.accent,
    "--shop-accent-ink": theme.colors.accentInk,
    "--shop-hero": theme.colors.hero,
    "--shop-radius": theme.radius,
    "--shop-heading": theme.heading === "serif" ? "var(--font-display)" : "var(--font-inter)",
  } as CSSProperties;
}
