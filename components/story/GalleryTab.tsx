"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { imageUrl } from "@/lib/supabase";
import SectionHeader from "./SectionHeader";
import type { OverviewPhoto } from "./useStoryOverview";
import { formatShortDate, type SortOrder } from "./utils";

// Photos revealed per step. A multiple of the pattern length below, so the
// mosaic only ever ends on a partial block when the photos themselves run out.
const REVEAL = 15;

// One block = 5 photos filling a 3-column x 4-row area exactly:
//   [ BIG  BIG | s ]      rows 1-2
//   [ BIG  BIG | s ]
//   [ tall | BIG  BIG ]   rows 3-4
//   [ tall | BIG  BIG ]
const PATTERN = [
  "col-span-2 row-span-2",
  "",
  "",
  "row-span-2",
  "col-span-2 row-span-2",
];

export default function GalleryTab({
  photos,
  order,
  onOpen,
}: {
  photos: OverviewPhoto[];
  order: SortOrder;
  onOpen: (index: number, list: OverviewPhoto[]) => void;
}) {
  const list = useMemo(
    () => (order === "oldest" ? photos : [...photos].reverse()),
    [photos, order],
  );
  const [visible, setVisible] = useState(REVEAL);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shown = list.slice(0, visible);
  const hasMore = visible < list.length;

  // Same infinite-reveal pattern as the chapters, just client-side.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!hasMore || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => v + REVEAL);
        }
      },
      { rootMargin: "0px 0px 700px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visible]);

  // A trailing partial block would leave a big tile with an empty neighbour,
  // so the last (incomplete) block falls back to uniform tiles.
  const lastBlockStart = Math.floor(list.length / PATTERN.length) * PATTERN.length;
  const trailing = list.length - lastBlockStart < PATTERN.length;

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader
        eyebrow="every photo"
        title="Our Photos"
        subtitle="tap any one to see it big"
      />

      {list.length === 0 ? (
        <p className="text-center font-serif text-lg italic text-[#7a5560]">
          No photos yet — they&rsquo;ll gather here as chapters are written.
        </p>
      ) : (
        <ul className="grid auto-rows-[7rem] grid-flow-dense grid-cols-3 gap-2 sm:auto-rows-[13rem] sm:gap-3 lg:auto-rows-[14rem]">
          {shown.map((p, i) => {
            const uniform = trailing && i >= lastBlockStart;
            return (
              <li
                key={`${p.momentId}-${p.path}`}
                className={`story-rise ${uniform ? "" : PATTERN[i % PATTERN.length]}`}
                style={{ animationDelay: `${(i % REVEAL) * 35}ms` }}
              >
                <button
                  type="button"
                  data-photo=""
                  onClick={() => onOpen(i, list)}
                  aria-label={`Open photo ${i + 1} of ${list.length}, ${formatShortDate(p.occurredAt)}${p.title ? `: ${p.title}` : ""}`}
                  className="group relative block h-full w-full overflow-hidden rounded-2xl border border-white/70 bg-rose-100 shadow-[0_12px_30px_-12px_rgba(180,80,110,0.35)] sm:rounded-3xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl(p.path)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-[50%_30%] transition duration-500 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3a2030]/80 to-transparent px-3 pb-2.5 pt-8 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {formatShortDate(p.occurredAt)}
                    {p.title ? ` · ${p.title}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}
    </div>
  );
}
