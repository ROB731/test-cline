import { Icon } from "@/components/icons";

/** Affiché uniquement hors production : aucun SMS n'est réellement envoyé. */
export function DevCode({ code }: { code?: string }) {
  if (!code) return null;
  return (
    <div className="flex gap-2.5 rounded-lg border border-line bg-paper px-3 py-2.5">
      <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" />
      <p className="text-[11.5px] leading-relaxed text-muted">
        Mode démonstration, aucun SMS envoyé. Votre code :{" "}
        <span className="font-mono text-[13px] font-medium text-ink">{code}</span>
      </p>
    </div>
  );
}
