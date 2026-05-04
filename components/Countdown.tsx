"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

function getTimeLeft(target: Date): TimeLeft {
  const totalMs = target.getTime() - Date.now();
  const clamped = Math.max(0, totalMs);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { days, hours, minutes, seconds, totalMs };
}

const pad = (n: number) => n.toString().padStart(2, "0");

type Props = {
  title: string;
  subtitle: string;
  targetISO: string;
  accent: "rose" | "amber";
  emoji: string;
};

const accentStyles = {
  rose: {
    card: "from-rose-50/80 to-pink-100/60 border-rose-200/70",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    tile: "bg-white/70 border-rose-200/60",
    digit: "text-rose-700",
    label: "text-rose-500",
    accentBar: "bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300",
  },
  amber: {
    card: "from-amber-50/80 to-orange-100/60 border-amber-200/70",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    tile: "bg-white/70 border-amber-200/60",
    digit: "text-amber-700",
    label: "text-amber-600",
    accentBar: "bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300",
  },
} as const;

export default function Countdown({
  title,
  subtitle,
  targetISO,
  accent,
  emoji,
}: Props) {
  const target = new Date(targetISO);
  const [time, setTime] = useState<TimeLeft | null>(null);
  const styles = accentStyles[accent];

  useEffect(() => {
    setTime(getTimeLeft(target));
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  const isPast = time !== null && time.totalMs <= 0;
  const dateLabel = target.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`fade-in relative rounded-3xl border bg-gradient-to-br ${styles.card} p-8 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] backdrop-blur-sm sm:p-10`}
    >
      <div
        className={`absolute inset-x-8 top-0 h-[2px] ${styles.accentBar} rounded-b-full opacity-70`}
      />

      <div className="flex flex-col items-center gap-2 text-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${styles.badge}`}
        >
          <span aria-hidden>{emoji}</span>
          {subtitle}
        </span>
        <h2 className="font-serif text-4xl font-medium tracking-tight text-[#3a2030] sm:text-5xl">
          {title}
        </h2>
        <p className="text-sm text-[#7a5560] sm:text-base">{dateLabel}</p>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-3 sm:gap-4">
        {(
          [
            ["Days", time?.days],
            ["Hours", time?.hours],
            ["Minutes", time?.minutes],
            ["Seconds", time?.seconds],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className={`flex flex-col items-center justify-center rounded-2xl border ${styles.tile} px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6`}
          >
            <span
              className={`font-serif text-3xl font-semibold tabular-nums sm:text-5xl ${styles.digit}`}
            >
              {value === undefined ? "--" : label === "Days" ? value : pad(value)}
            </span>
            <span
              className={`mt-1 text-[10px] font-medium uppercase tracking-[0.18em] sm:text-xs ${styles.label}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {isPast && (
        <p className="mt-6 text-center font-serif text-lg italic text-[#7a5560]">
          The day has arrived.
        </p>
      )}
    </div>
  );
}
