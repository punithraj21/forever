"use client";

import { useEffect, useRef } from "react";
import type { Moment } from "@/lib/supabase";
import ChapterPage, { WaitLine } from "./ChapterPage";
import { Heart } from "./icons";
import { PAGE_SIZE, type useStoryFeed } from "./useStoryFeed";
import { calendarDaysBetween, type SortOrder } from "./utils";

type Feed = ReturnType<typeof useStoryFeed>;

const primaryButton =
  "rounded-full bg-rose-500 px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600";

export default function ChapterList({
  feed,
  order,
  unlocked,
  deletingId,
  onEdit,
  onDelete,
  onOpenPhoto,
}: {
  feed: Feed;
  order: SortOrder;
  unlocked: boolean;
  deletingId: string | null;
  onEdit: (m: Moment) => void;
  onDelete: (m: Moment) => void;
  onOpenPhoto: (paths: string[], index: number, alt: string) => void;
}) {
  const { items, total, fetching, loadingMore, error, hasMore, loadMore } = feed;

  // Infinite scroll. The observer is rebuilt after every fetch settles: a new
  // observer always reports its target's current state, so if the sentinel is
  // still near the viewport (tall screen, short page) the next page starts
  // immediately instead of waiting for a scroll that never comes.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const armed = hasMore && !fetching && !error;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!armed || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "0px 0px 900px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed, loadMore, items.length]);

  const initialLoading = total === null && !error;
  const empty = total === 0 && !error;
  const done = items.length > 0 && !hasMore && !error;

  return (
    <div className="mx-auto w-full max-w-2xl pt-6 sm:pt-2">
      {error && items.length === 0 && (
        <div
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center"
        >
          <p className="font-medium text-red-700">Couldn&rsquo;t load the story</p>
          <p className="mt-1 font-mono text-xs text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadMore()}
            className={`mt-4 ${primaryButton}`}
          >
            Try again
          </button>
        </div>
      )}

      {empty && (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-white/40 p-10 text-center">
          <p className="font-serif text-xl italic text-[#7a5560]">
            The story is just beginning…
          </p>
          {unlocked && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rose-500">
              tap &ldquo;Add chapter&rdquo; to write the first one
            </p>
          )}
        </div>
      )}

      {initialLoading && (
        <div role="status" className="space-y-20">
          <span className="sr-only">Loading our story…</span>
          <SkeletonChapter />
          <SkeletonChapter />
        </div>
      )}

      {items.map((m, index) => (
        <div
          key={m.id}
          className="story-rise"
          style={{ animationDelay: `${(index % PAGE_SIZE) * 60}ms` }}
        >
          {index > 0 && (
            <WaitLine
              days={calendarDaysBetween(items[index - 1].occurred_at, m.occurred_at)}
            />
          )}
          <ChapterPage
            m={m}
            unlocked={unlocked}
            deleting={deletingId === m.id}
            onEdit={() => onEdit(m)}
            onDelete={() => onDelete(m)}
            onOpenPhoto={onOpenPhoto}
          />
        </div>
      ))}

      {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}

      {loadingMore && items.length > 0 && (
        <div role="status" className="mt-20">
          <span className="sr-only">Loading more chapters…</span>
          <SkeletonChapter />
        </div>
      )}

      {error && items.length > 0 && (
        <div role="alert" className="mt-16 text-center">
          <p className="text-sm text-red-700">Couldn&rsquo;t load more chapters.</p>
          <button
            type="button"
            onClick={() => loadMore()}
            className={`mt-3 ${primaryButton}`}
          >
            Try again
          </button>
        </div>
      )}

      {done && (
        <div className="mt-20 flex flex-col items-center gap-3 pb-6">
          <div className="h-12 w-px bg-gradient-to-b from-rose-200 to-transparent" />
          <Heart size={16} className="text-rose-400" />
          <p className="font-serif text-base italic text-[#9a7080]">
            {order === "oldest"
              ? "…to be continued"
              : "…and that's where it all began"}
          </p>
        </div>
      )}
    </div>
  );
}

function SkeletonChapter() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="flex items-end gap-5">
        <div className="h-16 w-24 rounded-xl bg-rose-100/80" />
        <div className="space-y-2 pb-1">
          <div className="h-2.5 w-14 rounded-full bg-rose-100" />
          <div className="h-2.5 w-32 rounded-full bg-rose-100/70" />
        </div>
      </div>
      <div className="mt-6 h-9 w-3/4 rounded-xl bg-rose-100/80" />
      <div className="mt-7 space-y-3">
        <div className="h-4 w-full rounded-full bg-rose-100/70" />
        <div className="h-4 w-full rounded-full bg-rose-100/70" />
        <div className="h-4 w-11/12 rounded-full bg-rose-100/70" />
        <div className="h-4 w-2/3 rounded-full bg-rose-100/70" />
      </div>
    </div>
  );
}
