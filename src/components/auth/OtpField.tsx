"use client";

import { useState } from "react";

export function OtpField({ name = "code", autoFocus = false }: { name?: string; autoFocus?: boolean }) {
  const [value, setValue] = useState("");

  return (
    <input
      name={name}
      value={value}
      onChange={(event) => setValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      autoFocus={autoFocus}
      required
      placeholder="000000"
      aria-label="Code de vérification à 6 chiffres"
      className="input text-center font-mono text-[24px] tracking-[0.4em] placeholder:tracking-[0.4em] placeholder:text-line-strong"
    />
  );
}
