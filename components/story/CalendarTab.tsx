"use client";

import { useMemo, useState } from "react";
import DaySheet from "./DaySheet";
import SectionHeader from "./SectionHeader";
import {
  WEDDING_DAY_KEY,
  averageGapDays,
  dayKey,
  diffDays,
  monthCells,
  monthOfKey,
  monthTitle,
  monthsNewestFirst,
  type MonthRef,
} from "./calendar";
import type { Overview, OverviewMeeting } from "./useStoryOverview";
import { formatShortDate, toDateInputValue } from "./utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
type Status = "meeting" | "waiting" | "none";

// Every day we met, as a calendar. The story here is a meeting, then a wait, so
// a solid rose circle marks a day we met and a soft band runs through the days
// between — the waiting — so the rhythm shows at a glance. Months run newest
// first (this month on top); the wedding day sits ahead of them in its own card.
export default function CalendarTab({
  overview,
  onRead,
}: {
  overview: Overview;
  onRead: (momentId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const todayKey = useMemo(() => toDateInputValue(new Date()), []);

  const { byDay, dayKeys } = useMemo(() => {
    const map = new Map<string, OverviewMeeting[]>();
    for (const m of overview.meetings) {
      const key = toDateInputValue(new Date(m.occurredAt));
      const list = map.get(key);
      if (list) list.push(m);
      else map.set(key, [m]);
    }
    return { byDay: map, dayKeys: [...map.keys()].sort() };
  }, [overview.meetings]);

  if (dayKeys.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <SectionHeader eyebrow="every day we met" title="Our Calendar" />
        <div className="rounded-3xl border border-dashed border-rose-200 bg-white/40 p-10 text-center">
          <p className="font-serif text-xl italic text-[#7a5560]">
            The calendar fills in as chapters are written.
          </p>
        </div>
      </div>
    );
  }

  const firstKey = dayKeys[0];
  const lastKey = dayKeys[dayKeys.length - 1];
  const endKey = lastKey > todayKey ? lastKey : todayKey;
  const months = monthsNewestFirst(firstKey, endKey);
  const avg = averageGapDays(dayKeys);

  const idx = (m: MonthRef) => m.year * 12 + m.month0;
  const toWedding = diffDays(todayKey, WEDDING_DAY_KEY);
  const showAhead = toWedding > 0 && idx(monthOfKey(WEDDING_DAY_KEY)) > idx(monthOfKey(endKey));

  const grid = (m: MonthRef, tone: "rose" | "amber") => (
    <MonthGrid
      month={m}
      byDay={byDay}
      firstKey={firstKey}
      todayKey={todayKey}
      tone={tone}
      onPick={setSelected}
    />
  );

  return (
    <div className="mx-auto max-w-xl">
      <SectionHeader eyebrow="every day we met" title="Our Calendar" subtitle="tap a day to open it" />

      <p className="mx-auto max-w-md text-center font-serif text-lg italic leading-relaxed text-[#7a5560]">
        We&rsquo;ve met on {dayKeys.length} {dayKeys.length === 1 ? "day" : "days"} since{" "}
        {formatShortDate(byDay.get(firstKey)![0].occurredAt)}
        {avg ? ` — about once every ${avg} ${avg === 1 ? "day" : "days"}` : ""}.
      </p>

      <ul
        aria-label="Legend"
        className="mb-8 mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9a7080]"
      >
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-rose-500 to-pink-500" />
          we met
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3.5 w-6 rounded-full bg-rose-100" />
          waiting
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400" />
          wedding day
        </li>
      </ul>

      {showAhead && (
        <div className="mb-8">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.28em] text-amber-700">
            the day we&rsquo;re waiting for · {toWedding} {toWedding === 1 ? "day" : "days"} to go
          </p>
          {grid(monthOfKey(WEDDING_DAY_KEY), "amber")}
        </div>
      )}

      <ol className="space-y-6">
        {months.map((m) => (
          <li key={`${m.year}-${m.month0}`}>{grid(m, "rose")}</li>
        ))}
      </ol>

      {selected && byDay.get(selected) && (
        <DaySheet meetings={byDay.get(selected)!} onClose={() => setSelected(null)} onRead={onRead} />
      )}
    </div>
  );
}

function MonthGrid({
  month,
  byDay,
  firstKey,
  todayKey,
  tone,
  onPick,
}: {
  month: MonthRef;
  byDay: Map<string, OverviewMeeting[]>;
  firstKey: string;
  todayKey: string;
  tone: "rose" | "amber";
  onPick: (key: string) => void;
}) {
  const cells = monthCells(month);
  const keys = cells.map((d) => (d === null ? null : dayKey(month.year, month.month0, d)));
  const status: Status[] = keys.map((k) =>
    k === null ? "none" : byDay.has(k) ? "meeting" : k > firstKey && k < todayKey ? "waiting" : "none",
  );
  const meetingDays = keys.filter((k) => k && byDay.has(k)).length;
  const amber = tone === "amber";

  return (
    <section
      aria-label={monthTitle(month)}
      className={`rounded-3xl border p-4 sm:p-5 ${
        amber
          ? "border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-100/50"
          : "border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-pink-100/50"
      }`}
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl text-[#3a2030]">{monthTitle(month)}</h3>
        {!amber && (
          <span className={`text-xs ${meetingDays ? "font-medium text-rose-600" : "text-[#b79aa6]"}`}>
            {meetingDays ? `${meetingDays} ${meetingDays === 1 ? "meeting" : "meetings"}` : "waiting"}
          </span>
        )}
      </header>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w, i) => (
          <span
            key={i}
            aria-hidden
            className="pb-1.5 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[#b79aa6]"
          >
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`blank-${i}`} />;
          const key = keys[i]!;
          const col = i % 7;
          const st = status[i];
          const prev: Status = col > 0 ? status[i - 1] : "none";
          const next: Status = col < 6 ? (status[i + 1] ?? "none") : "none";
          const isToday = key === todayKey;
          const isWedding = key === WEDDING_DAY_KEY;
          const meetings = byDay.get(key);

          // The waiting band: full-width on a waiting day, rounded where it starts
          // and ends, and tucked half-way behind a meeting circle at either end
          // so the wait reads as one stretch between two meetings.
          const band = "absolute inset-y-1 bg-rose-100/80";
          const joinsLeft = prev === "waiting" || prev === "meeting";
          const joinsRight = next === "waiting" || next === "meeting";

          return (
            <div key={key} className="relative flex h-11 items-center justify-center">
              {st === "waiting" && (
                <span
                  aria-hidden
                  className={`${band} inset-x-0 ${joinsLeft ? "" : "rounded-l-full"} ${
                    joinsRight ? "" : "rounded-r-full"
                  }`}
                />
              )}
              {st === "meeting" && prev === "waiting" && (
                <span aria-hidden className={`${band} left-0 right-1/2`} />
              )}
              {st === "meeting" && next === "waiting" && (
                <span aria-hidden className={`${band} left-1/2 right-0`} />
              )}

              {meetings ? (
                <button
                  type="button"
                  onClick={() => onPick(key)}
                  aria-label={`${formatShortDate(meetings[0].occurredAt)}: ${meetings
                    .map((m) => m.title ?? "a day together")
                    .join(", ")}`}
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 ${
                    isWedding
                      ? "bg-gradient-to-br from-amber-400 to-orange-400 shadow-[0_6px_14px_-6px_rgba(217,119,6,0.7)]"
                      : "bg-gradient-to-br from-rose-500 to-pink-500 shadow-[0_6px_14px_-6px_rgba(225,29,72,0.65)]"
                  } ${isToday ? "ring-2 ring-rose-300 ring-offset-2 ring-offset-rose-50" : ""}`}
                >
                  {d}
                  {meetings.length > 1 && (
                    <span
                      aria-hidden
                      className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-rose-600 shadow"
                    >
                      {meetings.length}
                    </span>
                  )}
                </button>
              ) : isWedding ? (
                <span
                  aria-label="Our wedding day"
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-sm font-semibold text-white shadow-[0_6px_14px_-6px_rgba(217,119,6,0.7)]"
                >
                  {d}
                </span>
              ) : (
                <span
                  aria-hidden
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                    isToday
                      ? "font-semibold text-rose-700 ring-2 ring-rose-400"
                      : st === "waiting"
                        ? "text-[#9a7080]"
                        : "text-[#b79aa6]"
                  }`}
                >
                  {d}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
