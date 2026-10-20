"use client";

import { useState } from "react";
import { IconCopy } from "@/components/icons";

export function CopyButton({
  value,
  label = "Copier",
  className = "btn btn-outline",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className={className}>
      <IconCopy className="h-4 w-4" />
      {copied ? "Copié !" : label}
    </button>
  );
}
