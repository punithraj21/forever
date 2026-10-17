"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase, type Moment } from "@/lib/supabase";
import ChapterForm from "./ChapterForm";
import ChapterReader from "./ChapterReader";
import Lightbox from "./Lightbox";
import MemoryTile from "./MemoryTile";
import MonthTile from "./MonthTile";
import { Heart, Plus } from "./icons";
import { PAGE_SIZE, useStoryFeed } from "./useStoryFeed";
import {
  extractErrorMessage,
  formatMonthName,
  formatMonthYear,
  formatShortDate,
  formatYear,
  monthKey,
  type SortOrder,
} from "./utils";

const UNLOCK_KEY = "moments_unlocked";

// Same primary button as the home page's "Share blessing".
const primaryButton =
  "rounded-full bg-rose-500 px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600";

const gridClass = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4";

type Cell =
  | { kind: "month"; key: string; label: string; month: string; year: string }
  | { kind: "chapter"; m: Moment; day: number; index: number };

export default function StoryFeed() {
  const [order, setOrder] = useState<SortOrder>("oldest");
  const [unlocked, setUnlocked] = useState(false);
  const [editing, setEditing] = useState<Moment | "new" | null>(null);
  const [readerIndex, setReaderIndex] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{
    paths: string[];
    index: number;
    alt: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const feedTopRef = useRef<HTMLDivElement>(null);

  const {
    items,
    total,
    firstDate,
    fetching,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload,
  } = useStoryFeed(order);

  useEffect(() => {
    setUnlocked(localStorage.getItem(UNLOCK_KEY) === "true");
  }, []);

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

  // Reading forward past what's loaded pulls the next page in, so the reader
  // behaves like one endless book.
  useEffect(() => {
    if (readerIndex === null || !hasMore || fetching || error) return;
    if (readerIndex >= items.length - 2) loadMore();
  }, [readerIndex, items.length, hasMore, fetching, error, loadMore]);

  // A reload (edit / delete / sort flip) can shorten the list under the reader.
  useEffect(() => {
    if (readerIndex !== null && readerIndex >= items.length) {
      setReaderIndex(null);
    }
  }, [readerIndex, items.length]);

  const changeOrder = (next: SortOrder) => {
    if (next === order) return;
    setOrder(next);
    feedTopRef.current?.scrollIntoView({ block: "start" });
  };

  const onDelete = async (m: Moment) => {
    setDeletingId(m.id);
    setActionError(null);
    try {
      // Row first: if this fails nothing is lost. Orphaned files are harmless;
      // a row pointing at deleted files is not.
      const { error } = await supabase.from("moments").delete().eq("id", m.id);
      if (error) throw error;
      if (m.image_paths?.length) {
        await supabase.storage.from("moments").remove(m.image_paths);
      }
      await reload();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // Day N is the chapter's chronological ordinal, so in newest-first mode it
  // counts down from the total.
  const dayFor = useCallback(
    (index: number) =>
      order === "oldest" ? index + 1 : (total ?? items.length) - index,
    [order, total, items.length],
  );

  // One flat list: a month tile precedes each month's first chapter, so the
  // wall stays a single dense grid with no half-empty rows between months.
  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = [];
    let lastKey: string | null = null;
    items.forEach((m, index) => {
      const key = monthKey(m.occurred_at);
      if (key !== lastKey) {
        out.push({
          kind: "month",
          key,
          label: formatMonthYear(m.occurred_at),
          month: formatMonthName(m.occurred_at),
          year: formatYear(m.occurred_at),
        });
        lastKey = key;
      }
      out.push({ kind: "chapter", m, day: dayFor(index), index });
    });
    return out;
  }, [items, dayFor]);

  const openPhoto = useCallback(
    (paths: string[], index: number, alt: string) =>
      setLightbox({ paths, index, alt }),
    [],
  );
  const closeReader = useCallback(() => setReaderIndex(null), []);
  const prevChapter = useCallback(
    () => setReaderIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const nextChapter = useCallback(
    () =>
      setReaderIndex((i) => (i !== null && i < items.length - 1 ? i + 1 : i)),
    [items.length],
  );

  const initialLoading = total === null && !error;
  const empty = total === 0 && !error;
  const done = items.length > 0 && !hasMore && !error;
  const readerItem = readerIndex !== null ? (items[readerIndex] ?? null) : null;

  return (
    <div className="w-full">
      <header className="fade-in text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          chapter by chapter
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight text-[#3a2030] sm:text-6xl">
          Our Story
        </h1>
        <p className="mt-3 font-serif text-lg italic text-[#7a5560]">
          from the day we met
        </p>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
        <div className="mt-6 flex h-8 items-center justify-center">
          {firstDate && (
            <p className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
              <Heart size={12} className="text-rose-500" />
              Since {formatShortDate(firstDate)}
            </p>
          )}
        </div>
      </header>

      {/* Sticky, so the sort is one tap away from anywhere on the wall */}
      <div className="sticky top-0 z-30 -mx-5 mt-8 border-y border-rose-200/50 bg-[#fff8f3]/80 px-5 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3">
          {total ? (
            <>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-rose-700">
                <Heart size={12} className="text-rose-500" />
                {total} {total === 1 ? "chapter" : "chapters"}
              </p>
              {total >= 2 && (
                <div
                  role="group"
                  aria-label="Sort chapters"
                  className="inline-flex rounded-full border border-rose-200/60 bg-white/70 p-0.5"
                >
                  {(["oldest", "newest"] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => changeOrder(o)}
                      aria-pressed={order === o}
                      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition ${
                        order === o
                          ? "border-rose-200 bg-rose-100 text-rose-700"
                          : "border-transparent text-[#9a7080] hover:text-rose-600"
                      }`}
                    >
                      {o === "oldest" ? "Oldest" : "Newest"}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div ref={feedTopRef} className="mt-10 w-full scroll-mt-20">
        {actionError && (
          <div
            role="alert"
            className="mx-auto mb-8 flex max-w-xl items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700"
          >
            <div>
              <p className="font-medium">That didn&rsquo;t work</p>
              <p className="mt-1 font-mono text-xs">{actionError}</p>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="shrink-0 text-xs font-medium uppercase tracking-wide text-red-600"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && items.length === 0 && (
          <div
            role="alert"
            className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center"
          >
            <p className="font-medium text-red-700">
              Couldn&rsquo;t load the story
            </p>
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
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-rose-200 bg-white/40 p-10 text-center">
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
          <div role="status">
            <span className="sr-only">Loading our story…</span>
            <ul className={gridClass}>
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <SkeletonTile />
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <ul className={gridClass}>
            {cells.map((cell) =>
              cell.kind === "month" ? (
                <li key={`month-${cell.key}`} aria-label={cell.label}>
                  <MonthTile month={cell.month} year={cell.year} />
                </li>
              ) : (
                <li
                  key={cell.m.id}
                  className="story-rise"
                  style={{
                    animationDelay: `${(cell.index % PAGE_SIZE) * 45}ms`,
                  }}
                >
                  <MemoryTile
                    m={cell.m}
                    day={cell.day}
                    deleting={deletingId === cell.m.id}
                    onOpen={() => setReaderIndex(cell.index)}
                  />
                </li>
              ),
            )}
            {/* Placeholders continue the same grid while the next page loads */}
            {loadingMore &&
              Array.from({ length: 3 }, (_, i) => (
                <li key={`sk-${i}`} aria-hidden>
                  <SkeletonTile />
                </li>
              ))}
          </ul>
        )}

        {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}

        {loadingMore && items.length > 0 && (
          <p role="status" className="sr-only">
            Loading more chapters…
          </p>
        )}

        {error && items.length > 0 && (
          <div role="alert" className="pb-8 text-center">
            <p className="text-sm text-red-700">
              Couldn&rsquo;t load more chapters.
            </p>
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
          <div className="flex flex-col items-center gap-3 pb-6 pt-10">
            <div className="h-10 w-px bg-gradient-to-b from-rose-200 to-transparent" />
            <Heart size={16} className="text-rose-400" />
            <p className="font-serif text-sm italic text-[#9a7080]">
              {order === "oldest"
                ? "…to be continued"
                : "…and that's where it all began"}
            </p>
          </div>
        )}
      </div>

      {unlocked &&
        typeof document !== "undefined" &&
        createPortal(
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="fixed right-5 z-30 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-[0_12px_28px_-8px_rgba(225,29,72,0.55)] transition hover:bg-rose-600 active:scale-95"
            style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <Plus size={18} />
            Add chapter
          </button>,
          document.body,
        )}

      {readerItem && readerIndex !== null && (
        <ChapterReader
          m={readerItem}
          day={dayFor(readerIndex)}
          total={total ?? items.length}
          prevDay={readerIndex > 0 ? dayFor(readerIndex - 1) : null}
          nextDay={
            readerIndex < items.length - 1 ? dayFor(readerIndex + 1) : null
          }
          nextLoading={hasMore}
          unlocked={unlocked}
          lightboxOpen={lightbox !== null}
          onClose={closeReader}
          onPrev={prevChapter}
          onNext={nextChapter}
          onEdit={() => {
            setReaderIndex(null);
            setEditing(readerItem);
          }}
          onDelete={() => {
            setReaderIndex(null);
            onDelete(readerItem);
          }}
          onOpenPhoto={openPhoto}
        />
      )}

      {editing && (
        <ChapterForm
          existing={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {lightbox && (
        <Lightbox
          paths={lightbox.paths}
          initialIndex={lightbox.index}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function SkeletonTile() {
  return (
    <div
      aria-hidden
      className="aspect-[3/4] animate-pulse rounded-3xl border border-rose-200/60 bg-gradient-to-br from-rose-100/80 to-pink-100/60"
    />
  );
}
