"use client";

// "N days to go" pill for the invitation. Pages are prerendered, so the number
// is computed in the browser (local calendar days, so it flips at the visitor's
// midnight); it renders an invisible placeholder first to avoid a layout jump
// and a hydration mismatch.

import { useEffect, useState } from "react";

type Labels = { many: string; one: string; today: string; done: string };

export default function DaysToGo({
  labels,
  year,
  month,
  day,
}: {
  labels: Labels;
  year: number;
  month: number; // 1-12
  day: number;
}) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const target = Date.UTC(year, month - 1, day);
    const n = Math.round((target - today) / 86_400_000);
    setText(
      n > 1
        ? labels.many.replace("{n}", String(n))
        : n === 1
          ? labels.one
          : n === 0
            ? labels.today
            : labels.done,
    );
  }, [labels, year, month, day]);

  return (
    <p
      className="inline-flex min-h-[2.25rem] items-center gap-2 rounded-full border border-amber-500/50 bg-amber-50/70 px-5 py-1.5 font-serif text-lg italic text-[#7a1f2b]"
      style={{ visibility: text ? "visible" : "hidden" }}
    >
      <span aria-hidden className="text-xs text-amber-600">
        ✦
      </span>
      {text ?? " "}
      <span aria-hidden className="text-xs text-amber-600">
        ✦
      </span>
    </p>
  );
}
