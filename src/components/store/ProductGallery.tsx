"use client";

import { useState } from "react";
import { Lightbox } from "@/components/store/Lightbox";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-brand-50 text-5xl">
        🖼️
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-line bg-white"
        aria-label="Agrandir la photo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[index]} alt={name} className="h-full w-full object-cover" />
        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white">
          🔍 Toucher pour zoomer
        </span>
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                i === index ? "border-brand-600" : "border-transparent opacity-80"
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <Lightbox
          images={images}
          index={index}
          name={name}
          onIndex={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
