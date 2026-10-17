"use client";

import type { Moment } from "@/lib/supabase";
import OwnerMenu from "./OwnerMenu";
import PhotoCarousel from "./PhotoCarousel";
import {
  dayOfMonth,
  formatGap,
  formatLongDate,
  formatWeekday,
} from "./utils";

// One entry, set like a page in a book: no card, no rail — the date as a pale
// oversized numeral, the title, the photo(s) as a figure, then the FULL note on
// the page (these are mostly writing, so never truncated or tucked behind a tap).
//
// Entries are identified by their real date, never a "Day N": they are the times
// we met, weeks apart, so counting them like consecutive days would be wrong.
export default function ChapterPage({
  m,
  unlocked,
  deleting,
  onEdit,
  onDelete,
  onOpenPhoto,
}: {
  m: Moment;
  unlocked: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onOpenPhoto: (paths: string[], index: number, alt: string) => void;
}) {
  const photos = m.image_paths ?? [];
  const alt = m.title ?? "A moment from our story";
  const note = m.note?.trim() ?? "";
  // A drop cap only suits a real paragraph that starts with a letter.
  const dropCap = note.length > 120 && /^[A-Za-z]/.test(note);

  return (
    <article
      id={`chapter-${m.id}`}
      data-chapter=""
      data-date={m.occurred_at}
      aria-label={`${formatLongDate(m.occurred_at)}${m.title ? `: ${m.title}` : ""}`}
      className={`scroll-mt-28 transition ${
        deleting ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-end gap-4 sm:gap-5">
          <span
            aria-hidden
            className="select-none font-serif text-7xl font-light leading-[0.8] text-rose-200 tabular-nums lining-nums sm:text-8xl"
          >
            {dayOfMonth(m.occurred_at)}
          </span>
          <div className="pb-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-500">
              {formatWeekday(m.occurred_at)}
            </p>
            <p className="mt-1 text-sm text-[#7a5560]">
              {formatLongDate(m.occurred_at)}
            </p>
          </div>
        </div>
        {unlocked && <OwnerMenu onEdit={onEdit} onDelete={onDelete} />}
      </header>

      {m.title && (
        <h3 className="mt-6 font-serif text-4xl font-light leading-[1.1] tracking-tight text-[#3a2030] sm:text-5xl">
          {m.title}
        </h3>
      )}

      {photos.length > 0 && (
        <figure className="mt-7 sm:-mx-8">
          <PhotoCarousel
            photos={photos}
            alt={alt}
            maxHeight="72vh"
            className="rounded-2xl shadow-[0_24px_60px_-20px_rgba(180,80,110,0.4)]"
            onOpen={(i) => onOpenPhoto(photos, i, alt)}
          />
        </figure>
      )}

      {note && (
        <p
          className={`mt-7 whitespace-pre-wrap font-serif text-[1.3rem] leading-[1.8] text-[#3a2030]/90 sm:text-[1.4rem] ${
            dropCap
              ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1.5 first-letter:font-serif first-letter:text-7xl first-letter:font-light first-letter:leading-[0.8] first-letter:text-rose-600"
              : ""
          }`}
        >
          {note}
        </p>
      )}
    </article>
  );
}

// The wait between two entries, drawn to scale: the line grows with the gap
// (capped), so 43 days *looks* longer than 3. Time apart is the point of this
// story, so it gets a real element instead of a generic divider.
export function WaitLine({ days }: { days: number }) {
  const half = days <= 0 ? 18 : Math.min(22 + days * 1.6, 100);
  return (
    <div
      role="separator"
      aria-label={formatGap(days)}
      data-gap={days}
      className="my-10 flex flex-col items-center sm:my-14"
    >
      <span
        aria-hidden
        className="w-px bg-gradient-to-b from-transparent to-rose-300"
        style={{ height: half }}
      />
      <span className="my-2 rounded-full border border-rose-200 bg-rose-100/80 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-rose-700">
        {formatGap(days)}
      </span>
      <span
        aria-hidden
        className="w-px bg-gradient-to-t from-transparent to-rose-300"
        style={{ height: half }}
      />
    </div>
  );
}
