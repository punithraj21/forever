"use client";

// Easter egg: tapping the "Punith & Pallavi" heading rains rose petals across
// the viewport. Pure client-side — no backend.
//
// The petal overlay is portaled to document.body on purpose: the heading lives
// inside <header class="fade-in">, and .fade-in's lingering transform leaves the
// header a containing block for position:fixed children — a fixed overlay nested
// under it would clip to the header instead of the viewport. Portaling to body
// escapes that (same reason the Moments modals do — see CLAUDE.md "Modal &
// lightbox layout pattern"). Honors prefers-reduced-motion (CSS hides petals;
// burst() also no-ops).

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Petal = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
  gradient: string;
};

const GRADIENTS = [
  "linear-gradient(135deg, #fbcfe1, #f9a8c4)",
  "linear-gradient(135deg, #fde2e4, #f7b8cb)",
  "linear-gradient(135deg, #ffd9c0, #f7a8a0)",
  "linear-gradient(135deg, #f9c5d5, #ef9ab8)",
];

const PETALS_PER_BURST = 26;
const MAX_LIFE_MS = 6000;

export default function PetalEasterEgg() {
  const [mounted, setMounted] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const idRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const burst = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // respect reduced-motion preference
    }
    const fresh: Petal[] = Array.from({ length: PETALS_PER_BURST }, () => ({
      id: idRef.current++,
      left: Math.random() * 100,
      size: 9 + Math.random() * 12,
      duration: 3.2 + Math.random() * 2.2,
      delay: Math.random() * 0.5,
      drift: (Math.random() * 2 - 1) * 80,
      spin: (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 480),
      gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    }));
    setPetals((prev) => [...prev, ...fresh]);
    const ids = new Set(fresh.map((p) => p.id));
    window.setTimeout(() => {
      setPetals((prev) => prev.filter((p) => !ids.has(p.id)));
    }, MAX_LIFE_MS);
  }, []);

  return (
    <>
      <h1
        onClick={burst}
        className="cursor-pointer select-none font-serif text-5xl font-light tracking-tight text-[#3a2030] transition-transform active:scale-[0.98] sm:text-6xl"
        title="tap us 🌸"
      >
        Punith <span className="text-rose-400">&amp;</span> Pallavi
      </h1>

      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
            aria-hidden="true"
          >
            {petals.map((p) => (
              <span
                key={p.id}
                className="petal"
                style={
                  {
                    left: `${p.left}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    background: p.gradient,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                    "--drift": `${p.drift}px`,
                    "--spin": `${p.spin}`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
