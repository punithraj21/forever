"use client";

import { useEffect, useState } from "react";

const ENGAGEMENT = new Date("2026-06-21T00:00:00");
const WEDDING = new Date("2027-02-11T11:30:00");
const DAY_MS = 1000 * 60 * 60 * 24;
const HOUR_MS = 1000 * 60 * 60;

type Stats = {
  daysToEngagement: number;
  daysToWedding: number;
  weeksToEngagement: number;
  monthsToWedding: number;
  engagedDays: number;
  daysSinceEngagement: number;
  daysSinceWedding: number;
  hoursToWedding: number;
  hoursSinceWedding: number;
  todayLabel: string;
  postEngagement: boolean;
  postWedding: boolean;
};

function computeStats(now: Date): Stats {
  const msToEngagement = ENGAGEMENT.getTime() - now.getTime();
  const msToWedding = WEDDING.getTime() - now.getTime();
  const postEngagement = msToEngagement <= 0;
  const postWedding = msToWedding <= 0;

  const daysToEngagement = Math.max(0, Math.ceil(msToEngagement / DAY_MS));
  const daysToWedding = Math.max(0, Math.ceil(msToWedding / DAY_MS));
  const daysSinceEngagement = Math.max(0, Math.floor(-msToEngagement / DAY_MS));
  const daysSinceWedding = Math.max(0, Math.floor(-msToWedding / DAY_MS));

  const weeksToEngagement = Math.ceil(daysToEngagement / 7);
  const monthsToWedding = Math.max(0, Math.round(daysToWedding / 30.44));
  const engagedDays = Math.ceil(
    (WEDDING.getTime() - ENGAGEMENT.getTime()) / DAY_MS,
  );
  const hoursToWedding = Math.max(0, Math.floor(msToWedding / HOUR_MS));
  const hoursSinceWedding = Math.max(0, Math.floor(-msToWedding / HOUR_MS));
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
    daysSinceEngagement,
    daysSinceWedding,
    hoursToWedding,
    hoursSinceWedding,
    todayLabel,
    postEngagement,
    postWedding,
  };
}

const fmt = (n: number) => n.toLocaleString("en-US");

type MilestoneState = "past" | "today" | "future";
type MilestoneItem = {
  key: "today" | "engagement" | "wedding";
  title: string;
  date: string;
  distance: string;
  state: MilestoneState;
  dotClass: string;
};

function buildMilestoneList(now: Date, s: Stats): MilestoneItem[] {
  const today: MilestoneItem = {
    key: "today",
    title: "Today",
    date: s.todayLabel,
    state: "today",
    dotClass: "bg-[#3a2030]",
    distance: s.postWedding
      ? "married ❀"
      : s.postEngagement
        ? "we are engaged"
        : "we are here",
  };

  const engagement: MilestoneItem = {
    key: "engagement",
    title: "Engagement",
    date: "Jun 21, 2026",
    state: s.postEngagement ? "past" : "future",
    dotClass: s.postEngagement ? "bg-amber-300" : "bg-amber-400",
    distance: s.postEngagement
      ? s.daysSinceEngagement === 0
        ? "today ✦"
        : `${fmt(s.daysSinceEngagement)} days ago ✓`
      : `in ${fmt(s.daysToEngagement)} days`,
  };

  const wedding: MilestoneItem = {
    key: "wedding",
    title: "Wedding",
    date: "Feb 11, 2027",
    state: s.postWedding ? "past" : "future",
    dotClass: s.postWedding ? "bg-rose-300" : "bg-rose-500",
    distance: s.postWedding
      ? s.daysSinceWedding === 0
        ? "today ❀"
        : `${fmt(s.daysSinceWedding)} days ago ✓`
      : `in ${fmt(s.daysToWedding)} days`,
  };

  // Order: chronological — Today slots between completed and pending.
  const sortedByTime = [
    { item: engagement, time: ENGAGEMENT.getTime() },
    { item: wedding, time: WEDDING.getTime() },
    { item: today, time: now.getTime() },
  ].sort((a, b) => a.time - b.time);

  return sortedByTime.map((x) => x.item);
}

export default function Journey({
  milestonesOnly = false,
  compact = false,
}: {
  milestonesOnly?: boolean;
  compact?: boolean;
} = {}) {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    const tick = () => setS(computeStats(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`w-full ${milestonesOnly ? "" : "space-y-14 sm:space-y-20"}`}
    >
      <section className="fade-in">
        <h3
          className={`text-center font-serif font-light tracking-tight text-[#3a2030] ${
            compact ? "mb-6 text-2xl sm:text-3xl" : "mb-10 text-3xl sm:text-4xl"
          }`}
        >
          Milestones
        </h3>
        <div className="relative px-2 sm:px-6">
          <div className="absolute left-[16.67%] right-[16.67%] top-[11px] h-px bg-gradient-to-r from-[#3a2030]/40 via-amber-400 to-rose-400" />
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {(s
              ? buildMilestoneList(new Date(), s)
              : [
                  {
                    key: "today" as const,
                    title: "Today",
                    date: "—",
                    distance: "—",
                    state: "today" as const,
                    dotClass: "bg-[#3a2030]",
                  },
                  {
                    key: "engagement" as const,
                    title: "Engagement",
                    date: "Jun 21, 2026",
                    distance: "—",
                    state: "future" as const,
                    dotClass: "bg-amber-400",
                  },
                  {
                    key: "wedding" as const,
                    title: "Wedding",
                    date: "Feb 11, 2027",
                    distance: "—",
                    state: "future" as const,
                    dotClass: "bg-rose-500",
                  },
                ]
            ).map((m) => (
              <Milestone
                key={m.key}
                dotClass={m.dotClass}
                title={m.title}
                date={m.date}
                distance={m.distance}
                state={m.state}
              />
            ))}
          </div>
        </div>
      </section>

      {!milestonesOnly && (
        <section className="fade-in">
          <h3 className="mb-10 text-center font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
            By the Numbers
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {buildStatTiles(s).map((tile) => (
              <StatTile
                key={tile.label}
                label={tile.label}
                value={tile.value}
                tone={tile.tone}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function buildStatTiles(
  s: Stats | null,
): Array<{
  label: string;
  value: number | undefined;
  tone: "amber" | "rose";
}> {
  if (!s) {
    return [
      { label: "Weeks to engagement", value: undefined, tone: "amber" },
      { label: "Days as fiancés", value: undefined, tone: "rose" },
      { label: "Months to wedding", value: undefined, tone: "rose" },
      { label: "Hours to 'I do'", value: undefined, tone: "rose" },
    ];
  }

  if (s.postWedding) {
    return [
      { label: "Days married", value: s.daysSinceWedding, tone: "rose" },
      { label: "Hours married", value: s.hoursSinceWedding, tone: "rose" },
      { label: "Days we were engaged", value: s.engagedDays, tone: "amber" },
      { label: "Days since Day 1", value: s.daysSinceWedding, tone: "rose" },
    ];
  }

  if (s.postEngagement) {
    return [
      { label: "Days engaged", value: s.daysSinceEngagement, tone: "amber" },
      {
        label: "Days as fiancés (total)",
        value: s.engagedDays,
        tone: "amber",
      },
      {
        label: "Weeks to wedding",
        value: Math.ceil(s.daysToWedding / 7),
        tone: "rose",
      },
      { label: "Hours to 'I do'", value: s.hoursToWedding, tone: "rose" },
    ];
  }

  return [
    { label: "Weeks to engagement", value: s.weeksToEngagement, tone: "amber" },
    { label: "Days as fiancés", value: s.engagedDays, tone: "rose" },
    { label: "Months to wedding", value: s.monthsToWedding, tone: "rose" },
    { label: "Hours to 'I do'", value: s.hoursToWedding, tone: "rose" },
  ];
}

function Milestone({
  dotClass,
  title,
  date,
  distance,
  state = "future",
}: {
  dotClass: string;
  title: string;
  date: string;
  distance: string;
  state?: MilestoneState;
}) {
  const titleClass =
    state === "past"
      ? "text-[#7a5560]"
      : state === "today"
        ? "text-[#3a2030]"
        : "text-[#3a2030]";
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-4 border-white shadow-[0_4px_12px_rgba(180,80,110,0.35)] ${dotClass}`}
      >
        {state === "past" && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </div>
      <div
        className={`mt-3 font-serif text-lg font-medium sm:text-xl ${titleClass}`}
      >
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
