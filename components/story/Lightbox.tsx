"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { imageUrl } from "@/lib/supabase";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { ChevronLeft, ChevronRight, Close } from "./icons";

const SWIPE_PX = 50;
// Matches the `lb-*` animation durations in globals.css.
const SLIDE_MS = 320;

// Portaled to <body>: an ancestor's lingering transform would otherwise turn
// `fixed inset-0` into "fill that ancestor" (see CLAUDE.md, modal pattern).
export default function Lightbox({
  paths,
  initialIndex,
  alt,
  captions,
  action,
  onClose,
}: {
  paths: string[];
  initialIndex: number;
  alt: string;
  // Per-photo captions (the gallery spans many chapters); falls back to `alt`.
  captions?: string[];
  // Optional button above the caption, e.g. "Read this chapter →".
  action?: { label: string; onClick: (index: number) => void };
  onClose: () => void;
}) {
  const total = paths.length;
  const [index, setIndex] = useState(initialIndex);
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;
  const touchStartX = useRef<number | null>(null);
  // Which way we last moved, and the photo that is sliding out. `dir` is null
  // until the first change, so opening the viewer doesn't animate.
  const [dir, setDir] = useState<1 | -1 | null>(null);
  const [leaving, setLeaving] = useState<{ src: string; dir: 1 | -1; n: number } | null>(null);
  const leaveCount = useRef(0);
  const indexRef = useRef(safeIndex);

  // Every way of changing photo goes through here: remember the one we are
  // leaving so it can slide out while the new one slides in.
  const go = (delta: 1 | -1) => {
    if (total < 2) return;
    setLeaving({
      src: imageUrl(paths[indexRef.current]),
      dir: delta,
      n: ++leaveCount.current,
    });
    setDir(delta);
    setIndex((i) => i + delta);
  };
  // The key handler below outlives renders, so it reads the latest of these.
  const goRef = useRef(go);
  useEffect(() => {
    indexRef.current = safeIndex;
    goRef.current = go;
  });

  // Drop the outgoing photo once its slide is over (a timer rather than
  // animationend, so reduced-motion users, who get no animation, are covered).
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setLeaving(null), SLIDE_MS + 60);
    return () => clearTimeout(t);
  }, [leaving]);

  // Warm the neighbours so the incoming photo is already there when it slides in.
  useEffect(() => {
    if (total < 2) return;
    for (const d of [1, -1]) {
      const img = new Image();
      img.src = imageUrl(paths[(((safeIndex + d) % total) + total) % total]);
    }
  }, [safeIndex, total, paths]);

  // Body lock lives in its own dep-less effect: onClose is an inline arrow at
  // the call site, so tying the lock to it would re-run it on every render.
  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goRef.current(-1);
      else if (e.key === "ArrowRight") goRef.current(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (total === 0 || typeof document === "undefined") return null;

  const step = (delta: 1 | -1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    go(delta);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start === null || total < 2) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {leaving && (
        <img
          key={`out-${leaving.n}`}
          src={leaving.src}
          alt=""
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full select-none object-contain ${
            leaving.dir > 0 ? "lb-out-next" : "lb-out-prev"
          }`}
          draggable={false}
        />
      )}
      <img
        // Remounting per photo restarts the slide-in animation.
        key={safeIndex}
        src={imageUrl(paths[safeIndex])}
        alt={alt}
        className={`absolute inset-0 h-full w-full select-none object-contain ${
          dir === null ? "" : dir > 0 ? "lb-in-next" : "lb-in-prev"
        }`}
        draggable={false}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
        style={{ marginTop: "env(safe-area-inset-top)" }}
      >
        <Close size={20} />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={step(-1)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:block"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={step(1)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:block"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-6 pt-12"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
        }}
      >
        {action && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(safeIndex);
            }}
            className="rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            {action.label}
          </button>
        )}
        <p
          key={safeIndex}
          className={`max-w-full truncate text-center text-xs uppercase tracking-[0.2em] text-white/80 ${
            dir === null ? "" : "lb-fade"
          }`}
        >
          {total > 1 ? `${safeIndex + 1} of ${total} · ` : ""}
          {captions?.[safeIndex] ?? alt}
        </p>
      </div>
    </div>,
    document.body,
  );
}
