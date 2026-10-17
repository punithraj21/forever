"use client";

import { BookOpen, ImageIcon, MapPin, SortArrows } from "./icons";
import type { SortOrder } from "./utils";

export type TabId = "story" | "photos" | "places";

export type TabDef = { id: TabId; label: string; count: number | null };

const ICONS = { story: BookOpen, photos: ImageIcon, places: MapPin } as const;

// A big segmented switch rather than small underlined links: it's the only way
// into Photos and Places, so it has to read as a control at a glance. White
// track, rose gradient thumb that slides to the active section (the same rose as
// the Add button), an icon and a count on every segment.
//
// Sticky so you can hop between sections from anywhere. Sections are tabs rather
// than stacked blocks because the story itself scrolls forever — anything
// stacked beneath it could never be reached.
export default function StoryTabs({
  tabs,
  tab,
  onTab,
}: {
  tabs: TabDef[];
  tab: TabId;
  onTab: (t: TabId) => void;
}) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === tab),
  );

  return (
    <div className="sticky top-0 z-30 -mx-5 border-y border-rose-200/50 bg-[#fff8f3]/85 px-5 py-2.5 backdrop-blur-md">
      <div
        role="tablist"
        aria-label="Sections"
        className="relative mx-auto grid max-w-xl rounded-full border border-rose-200 bg-white/85 p-1 shadow-[0_12px_32px_-14px_rgba(225,29,72,0.45)]"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-[0_8px_18px_-6px_rgba(225,29,72,0.65)] transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            width: `calc((100% - 0.5rem) / ${tabs.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {tabs.map((t) => {
          const active = t.id === tab;
          const Icon = ICONS[t.id];
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              onClick={() => onTab(t.id)}
              className={`relative z-10 inline-flex min-h-12 items-center justify-center gap-1 rounded-full px-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300 sm:gap-2 sm:px-2 sm:text-xs sm:tracking-[0.2em] ${
                active ? "text-white" : "text-rose-700 hover:text-rose-500"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {t.label}
              {t.count !== null && (
                <span
                  className={`min-w-[1.35rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tracking-normal tabular-nums transition-colors duration-300 ${
                    active ? "bg-white/25 text-white" : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Oldest/newest flip. Lives with the section it changes, not in the tab bar:
// beside the tabs it crowded them and read as a fourth tab.
export function SortToggle({
  order,
  onOrder,
}: {
  order: SortOrder;
  onOrder: (o: SortOrder) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOrder(order === "oldest" ? "newest" : "oldest")}
      aria-label={`Showing ${order} first — tap to flip`}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-white/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-700 transition hover:bg-white"
    >
      <SortArrows size={12} />
      {order === "oldest" ? "Oldest first" : "Newest first"}
    </button>
  );
}
