"use client";

import { useEffect, useState } from "react";

// Matches WEDDING in Journey.tsx / app/page.tsx (kept as separate constants,
// like the rest of the site). Update them together if the date moves.
const WEDDING = new Date("2027-02-11T11:30:00");
const DAY = 86_400_000;

type Tile = { value: string; label: string; tone: "rose" | "amber" };

// Same tile look as the home page's "By the Numbers". The last tile uses the
// amber accent, as the engagement/wedding countdown does on the home page.
export default function StoryNumbers({
  moments,
  photos,
  longestGapDays,
}: {
  moments: number | null;
  photos: number | null;
  longestGapDays: number | null;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString("en-US"));
  const toWedding = now === null ? null : WEDDING.getTime() - now;
  const married = toWedding !== null && toWedding <= 0;

  const tiles: Tile[] = [
    { value: fmt(moments), label: "Moments kept", tone: "rose" },
    { value: fmt(photos), label: "Photos kept", tone: "rose" },
    {
      value: fmt(longestGapDays),
      label: "Days, longest wait",
      tone: "rose",
    },
    {
      value:
        toWedding === null
          ? "—"
          : fmt(Math.max(0, Math.ceil(Math.abs(toWedding) / DAY))),
      label: married ? "Days married" : "Days to forever",
      tone: "amber",
    },
  ];

  const tone = {
    rose: {
      tile: "border-rose-200/60 from-rose-50/80 to-pink-100/50",
      value: "text-rose-700",
      label: "text-rose-500",
    },
    amber: {
      tile: "border-amber-200/70 from-amber-50/80 to-orange-100/50",
      value: "text-amber-700",
      label: "text-amber-600",
    },
  } as const;

  return (
    <section aria-label="Our story in numbers" className="mt-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`rounded-2xl border bg-gradient-to-br px-3 py-5 text-center ${tone[t.tone].tile}`}
          >
            <p
              className={`font-serif text-4xl font-semibold tabular-nums ${tone[t.tone].value}`}
            >
              {t.value}
            </p>
            <p
              className={`mt-1 text-[10px] font-medium uppercase tracking-[0.18em] sm:text-xs ${tone[t.tone].label}`}
            >
              {t.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
