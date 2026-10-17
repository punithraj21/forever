"use client";

import { imageUrl, type Moment } from "@/lib/supabase";
import { Layers } from "./icons";
import { formatTileDate } from "./utils";

// Text-only chapters alternate between the home page's two accents — rose for
// the wedding card, amber for the engagement card — so a run of notes still
// has rhythm.
const accents = {
  rose: {
    surface: "from-rose-50/90 to-pink-100/70 border-rose-200/70",
    bar: "from-rose-300 via-pink-300 to-rose-300",
    tile: "border-rose-200/60 text-rose-700",
    label: "text-rose-500",
    date: "text-rose-600",
  },
  amber: {
    surface: "from-amber-50/90 to-orange-100/60 border-amber-200/70",
    bar: "from-amber-300 via-orange-300 to-amber-300",
    tile: "border-amber-200/60 text-amber-700",
    label: "text-amber-600",
    date: "text-amber-700",
  },
} as const;

export default function MemoryTile({
  m,
  day,
  deleting,
  onOpen,
}: {
  m: Moment;
  day: number;
  deleting: boolean;
  onOpen: () => void;
}) {
  const photos = m.image_paths ?? [];
  const cover = photos[0];
  const date = formatTileDate(m.occurred_at);
  const accent = accents[day % 2 === 0 ? "amber" : "rose"];

  return (
    <button
      type="button"
      data-tile=""
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Open day ${day}${m.title ? `: ${m.title}` : ""}`}
      className={`group relative block aspect-[3/4] w-full overflow-hidden rounded-3xl border text-left shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-15px_rgba(180,80,110,0.35)] active:scale-[0.98] ${
        cover ? "border-white/70 bg-rose-100" : `bg-gradient-to-br ${accent.surface}`
      } ${deleting ? "pointer-events-none opacity-50" : ""}`}
    >
      {cover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(cover)}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_30%] transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a2030]/85 via-[#3a2030]/10 to-transparent" />
        </>
      ) : (
        <div
          aria-hidden
          className={`absolute inset-x-6 top-0 h-[2px] rounded-b-full bg-gradient-to-r ${accent.bar} opacity-70`}
        />
      )}

      {/* Same tile treatment as the countdown digits, shrunk to fit a corner */}
      <div
        className={`absolute left-3 top-3 flex h-12 w-12 flex-col-reverse items-center justify-center rounded-2xl border backdrop-blur-sm ${
          cover
            ? "border-white/60 bg-white/85 text-rose-700"
            : `bg-white/70 ${accent.tile}`
        }`}
      >
        <span
          className={`mt-0.5 text-[8px] font-medium uppercase tracking-[0.18em] ${
            cover ? "text-rose-500" : accent.label
          }`}
        >
          Day
        </span>
        <span className="font-serif text-2xl font-semibold leading-none tabular-nums">
          {day}
        </span>
      </div>

      {photos.length > 1 && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          <Layers size={12} />
          {photos.length}
        </span>
      )}

      {cover ? (
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/75">
            {date}
          </p>
          {m.title && (
            <h3 className="mt-1 line-clamp-2 font-serif text-lg leading-tight text-white sm:text-xl">
              {m.title}
            </h3>
          )}
        </div>
      ) : (
        <div className="relative flex h-full flex-col px-3.5 pb-3.5 pt-[68px] sm:px-4 sm:pb-4">
          {m.title && (
            <h3 className="line-clamp-3 font-serif text-xl leading-tight text-[#3a2030]">
              {m.title}
            </h3>
          )}
          {m.note && (
            <p
              className={`font-serif text-sm italic leading-snug text-[#5a3a4a] ${
                m.title ? "mt-1.5 line-clamp-4" : "line-clamp-[8] text-base"
              }`}
            >
              {m.note}
            </p>
          )}
          <p
            className={`mt-auto pt-2 text-[10px] font-medium uppercase tracking-[0.18em] ${accent.date}`}
          >
            {date}
          </p>
        </div>
      )}
    </button>
  );
}
