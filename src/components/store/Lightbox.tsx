"use client";

import { useEffect, useRef, useState } from "react";

const MAX_SCALE = 4;

export function Lightbox({
  images,
  index,
  name,
  onIndex,
  onClose,
}: {
  images: string[];
  index: number;
  name: string;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const drag = useRef<{ x: number; y: number; offsetX: number; offsetY: number; movedX: number; movedY: number } | null>(null);

  function reset() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  function go(delta: number) {
    reset();
    onIndex((index + delta + images.length) % images.length);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  });

  function touchStart(event: React.TouchEvent) {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinch.current = { distance, scale };
      drag.current = null;
    } else if (event.touches.length === 1) {
      const touch = event.touches[0];
      drag.current = {
        x: touch.clientX,
        y: touch.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
        movedX: 0,
        movedY: 0,
      };
    }
  }

  function touchMove(event: React.TouchEvent) {
    if (event.touches.length === 2 && pinch.current) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next = Math.min(
        MAX_SCALE,
        Math.max(1, (pinch.current.scale * distance) / pinch.current.distance),
      );
      setScale(next);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return;
    }

    if (event.touches.length === 1 && drag.current) {
      const touch = event.touches[0];
      const dx = touch.clientX - drag.current.x;
      const dy = touch.clientY - drag.current.y;
      drag.current.movedX = dx;
      drag.current.movedY = dy;
      if (scale > 1) {
        setOffset({ x: drag.current.offsetX + dx, y: drag.current.offsetY + dy });
      }
    }
  }

  function touchEnd(event: React.TouchEvent) {
    if (event.touches.length === 0) {
      const swipeX = drag.current?.movedX ?? 0;
      const swipeY = drag.current?.movedY ?? 0;
      const isSwipe = Math.abs(swipeX) > 60 && Math.abs(swipeX) > Math.abs(swipeY) * 1.5;
      pinch.current = null;
      drag.current = null;
      if (scale <= 1.02) reset();
      if (scale === 1 && images.length > 1 && isSwipe) {
        go(swipeX < 0 ? 1 : -1);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-xs font-semibold text-white/70">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white"
        >
          Fermer ✕
        </button>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        style={{ touchAction: "none" }}
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={touchEnd}
        onDoubleClick={() => (scale > 1 ? reset() : setScale(2.5))}
        onWheel={(event) => {
          const next = Math.min(MAX_SCALE, Math.max(1, scale - event.deltaY * 0.002));
          setScale(next);
          if (next === 1) reset();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${name} — photo ${index + 1}`}
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: drag.current ? "none" : "transform 120ms ease-out",
          }}
        />

        {images.length > 1 && scale === 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white"
              aria-label="Photo précédente"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white"
              aria-label="Photo suivante"
            >
              ›
            </button>
          </>
        )}
      </div>

      <p className="px-4 py-3 text-center text-[11px] text-white/60">
        Pince à deux doigts ou double-tap pour zoomer · glisse pour déplacer
      </p>
    </div>
  );
}
