"use client";

import { useFormStatus } from "react-dom";
import { updateTheme } from "@/lib/actions/store";
import { THEMES, type ThemeId } from "@/lib/themes";
import { Icon } from "@/components/icons";

function Status() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <p className="flex items-center gap-2 px-5 pb-4 text-[12px] text-muted">
      <Icon name="check" className="h-3.5 w-3.5" />
      Application du thème…
    </p>
  );
}

export function ThemePicker({ current }: { current: string }) {
  return (
    <form action={updateTheme}>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const selected = theme.id === (current as ThemeId);
          return (
            <label
              key={theme.id}
              className={`group cursor-pointer rounded-lg border p-3 transition ${
                selected
                  ? "border-brand-700 bg-brand-50/60 ring-1 ring-brand-700"
                  : "border-line bg-white hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={theme.id}
                defaultChecked={selected}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                className="sr-only"
              />

              <div
                className="flex h-20 items-end gap-2 overflow-hidden rounded border border-black/5 p-2"
                style={{ backgroundColor: theme.colors.bg }}
                aria-hidden
              >
                <span
                  className="flex-1 rounded-sm"
                  style={{ backgroundColor: theme.colors.accent, height: "38px" }}
                />
                <span
                  className="flex-1 rounded-sm border"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.line,
                    height: "52px",
                  }}
                />
                <span
                  className="flex-1 rounded-sm"
                  style={{ backgroundColor: theme.colors.line, height: "28px" }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span
                  className="text-[13px] font-medium"
                  style={{ fontFamily: theme.heading === "serif" ? "var(--font-display)" : "var(--font-inter)" }}
                >
                  {theme.label}
                </span>
                {selected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-800">
                    <Icon name="check" className="h-3 w-3" strokeWidth={2.6} />
                    Actif
                  </span>
                ) : (
                  <span className="text-[11px] text-muted group-hover:text-ink">Choisir</span>
                )}
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{theme.description}</p>
            </label>
          );
        })}
      </div>
      <Status />
    </form>
  );
}
