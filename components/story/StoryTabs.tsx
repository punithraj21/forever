"use client";

import type { SortOrder } from "./utils";

export type TabId = "story" | "photos" | "places";

export type TabDef = { id: TabId; label: string; count: number | null };

// Sticky so you can hop between sections (and flip the order) from anywhere.
// Sections are tabs rather than stacked blocks because the story itself scrolls
// forever — anything stacked beneath it could never be reached.
export default function StoryTabs({
  tabs,
  tab,
  onTab,
  order,
  onOrder,
}: {
  tabs: TabDef[];
  tab: TabId;
  onTab: (t: TabId) => void;
  order: SortOrder;
  onOrder: (o: SortOrder) => void;
}) {
  const sortable = tab !== "places";

  return (
    <div className="sticky top-0 z-30 -mx-5 border-y border-rose-200/50 bg-[#fff8f3]/80 px-5 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <div role="tablist" aria-label="Sections" className="flex gap-5 sm:gap-8">
          {tabs.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                onClick={() => onTab(t.id)}
                className={`relative py-4 text-xs font-medium uppercase tracking-[0.16em] transition sm:tracking-[0.22em] ${
                  active ? "text-rose-700" : "text-[#9a7080] hover:text-rose-600"
                }`}
              >
                {t.label}
                {t.count !== null && (
                  <span
                    className={`ml-1.5 hidden text-[10px] sm:inline ${
                      active ? "text-rose-400" : "text-[#c4a3b0]"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300"
                  />
                )}
              </button>
            );
          })}
        </div>

        {sortable && (
          <button
            type="button"
            onClick={() => onOrder(order === "oldest" ? "newest" : "oldest")}
            aria-label={`Showing ${order} first — tap to flip`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-200/70 bg-white/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-700 transition hover:bg-white"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m3 8 4-4 4 4" />
              <path d="M7 4v16" />
              <path d="m21 16-4 4-4-4" />
              <path d="M17 20V4" />
            </svg>
            {order === "oldest" ? "Oldest" : "Newest"}
          </button>
        )}
      </div>
    </div>
  );
}
