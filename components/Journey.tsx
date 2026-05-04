"use client";

import { useEffect, useState } from "react";

const ENGAGEMENT = new Date("2026-06-21T00:00:00");
const WEDDING = new Date("2026-12-14T00:00:00");
const DAY_MS = 1000 * 60 * 60 * 24;
const HOUR_MS = 1000 * 60 * 60;

type Stats = {
  daysToEngagement: number;
  daysToWedding: number;
  weeksToEngagement: number;
  monthsToWedding: number;
  engagedDays: number;
  hoursToWedding: number;
  todayLabel: string;
};

function computeStats(now: Date): Stats {
  const daysToEngagement = Math.max(
    0,
    Math.ceil((ENGAGEMENT.getTime() - now.getTime()) / DAY_MS),
  );
  const daysToWedding = Math.max(
    0,
    Math.ceil((WEDDING.getTime() - now.getTime()) / DAY_MS),
  );
  const weeksToEngagement = Math.ceil(daysToEngagement / 7);
  const monthsToWedding = Math.max(0, Math.round(daysToWedding / 30.44));
  const engagedDays = Math.ceil(
    (WEDDING.getTime() - ENGAGEMENT.getTime()) / DAY_MS,
  );
  const hoursToWedding = Math.max(
    0,
    Math.floor((WEDDING.getTime() - now.getTime()) / HOUR_MS),
  );
  const todayLabel = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    daysToEngagement,
    daysToWedding,
    weeksToEngagement,
    monthsToWedding,
    engagedDays,
    hoursToWedding,
    todayLabel,
  };
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function Journey() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    const tick = () => setS(computeStats(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full space-y-14 sm:space-y-20">
      <section className="fade-in">
        <h3 className="mb-10 text-center font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
          Milestones
        </h3>
        <div className="relative px-2 sm:px-6">
          <div className="absolute left-[16.67%] right-[16.67%] top-[11px] h-px bg-gradient-to-r from-[#3a2030]/40 via-amber-400 to-rose-400" />
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <Milestone
              dotClass="bg-[#3a2030]"
              title="Today"
              date={s?.todayLabel ?? "—"}
              distance="we are here"
            />
            <Milestone
              dotClass="bg-amber-400"
              title="Engagement"
              date="Jun 21, 2026"
              distance={s ? `in ${fmt(s.daysToEngagement)} days` : "—"}
            />
            <Milestone
              dotClass="bg-rose-500"
              title="Wedding"
              date="Dec 14, 2026"
              distance={s ? `in ${fmt(s.daysToWedding)} days` : "—"}
            />
          </div>
        </div>
      </section>

      <section className="fade-in">
        <h3 className="mb-10 text-center font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
          By the Numbers
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatTile
            label="Weeks to engagement"
            value={s?.weeksToEngagement}
            tone="amber"
          />
          <StatTile
            label="Days as fiancés"
            value={s?.engagedDays}
            tone="rose"
          />
          <StatTile
            label="Months to wedding"
            value={s?.monthsToWedding}
            tone="rose"
          />
          <StatTile
            label="Hours to 'I do'"
            value={s?.hoursToWedding}
            tone="rose"
          />
        </div>
      </section>
    </div>
  );
}

function Milestone({
  dotClass,
  title,
  date,
  distance,
}: {
  dotClass: string;
  title: string;
  date: string;
  distance: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`relative z-10 h-[22px] w-[22px] rounded-full border-4 border-white shadow-[0_4px_12px_rgba(180,80,110,0.35)] ${dotClass}`}
      />
      <div className="mt-3 font-serif text-lg font-medium text-[#3a2030] sm:text-xl">
        {title}
      </div>
      <div className="text-xs text-[#7a5560] sm:text-sm">{date}</div>
      <div className="mt-0.5 text-[11px] italic text-[#9a7080] sm:text-xs">
        {distance}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone: "rose" | "amber";
}) {
  const digit = tone === "rose" ? "text-rose-700" : "text-amber-700";
  const lbl = tone === "rose" ? "text-rose-500" : "text-amber-600";
  const border = tone === "rose" ? "border-rose-200/60" : "border-amber-200/60";
  return (
    <div
      className={`rounded-2xl border ${border} bg-white/60 px-3 py-5 text-center backdrop-blur-sm`}
    >
      <div
        className={`font-serif text-3xl font-semibold tabular-nums sm:text-4xl ${digit}`}
      >
        {value === undefined ? "—" : fmt(value)}
      </div>
      <div
        className={`mt-1 text-[10px] font-medium uppercase tracking-[0.16em] sm:text-xs ${lbl}`}
      >
        {label}
      </div>
    </div>
  );
}
