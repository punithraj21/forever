"use client";

import { useEffect, useState } from "react";
import { Heart } from "./icons";
import { formatLongDate } from "./utils";

const DAY = 86_400_000;

// The number that matters in this story is the wait between meetings, so the
// hero counts that — live — from the most recent entry. Same card + tile
// treatment as the home page's countdown cards.
export default function SinceLastMet({
  lastAt,
  lastTitle,
}: {
  lastAt: string | null;
  lastTitle: string | null;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms =
    lastAt && now !== null ? Math.max(0, now - new Date(lastAt).getTime()) : null;

  const units: [string, string][] = [
    ["Days", ms === null ? "—" : String(Math.floor(ms / DAY))],
    ["Hours", ms === null ? "—" : pad(Math.floor(ms / 3_600_000) % 24)],
    ["Minutes", ms === null ? "—" : pad(Math.floor(ms / 60_000) % 60)],
    ["Seconds", ms === null ? "—" : pad(Math.floor(ms / 1000) % 60)],
  ];

  return (
    <section
      aria-label="Time since we last met"
      className="fade-in relative rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/80 to-pink-100/60 p-6 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] sm:p-10"
    >
      <div
        aria-hidden
        className="absolute inset-x-8 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300 opacity-70"
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
          <Heart size={12} className="text-rose-500" />
          Waiting
        </span>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-[#3a2030] sm:text-4xl">
          Since we last met
        </h2>
        {lastAt && (
          <p className="text-sm text-[#7a5560] sm:text-base">
            {formatLongDate(lastAt)}
            {lastTitle ? ` · ${lastTitle}` : ""}
          </p>
        )}
      </div>

      <div className="mt-7 grid grid-cols-4 gap-3 sm:gap-4">
        {units.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-rose-200/60 bg-white/70 px-2 py-4 sm:px-4 sm:py-6"
          >
            <span className="font-serif text-3xl font-semibold tabular-nums text-rose-700 sm:text-5xl">
              {value}
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-rose-500 sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center font-serif text-base italic text-[#7a5560]">
        and counting… until we meet again
      </p>
    </section>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
