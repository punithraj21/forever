"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase, type Moment } from "@/lib/supabase";
import ChapterCard from "./ChapterCard";
import ChapterForm from "./ChapterForm";
import Lightbox from "./Lightbox";
import { Heart, Plus } from "./icons";
import { PAGE_SIZE, useStoryFeed } from "./useStoryFeed";
import {
  extractErrorMessage,
  formatMonthYear,
  formatShortDate,
  monthKey,
  type SortOrder,
} from "./utils";

const UNLOCK_KEY = "moments_unlocked";

type Entry = { m: Moment; day: number; index: number };
type Group = { key: string; label: string; entries: Entry[] };

export default function StoryFeed() {
  const [order, setOrder] = useState<SortOrder>("oldest");
  const [unlocked, setUnlocked] = useState(false);
  const [editing, setEditing] = useState<Moment | "new" | null>(null);
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
      { rootMargin: "0px 0px 800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed, loadMore, items.length]);

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
  const groups = useMemo<Group[]>(() => {
    const out: Group[] = [];
    items.forEach((m, index) => {
      const day = order === "oldest" ? index + 1 : (total ?? items.length) - index;
      const key = monthKey(m.occurred_at);
      const last = out[out.length - 1];
      if (last && last.key === key) last.entries.push({ m, day, index });
      else {
        out.push({
          key,
          label: formatMonthYear(m.occurred_at),
          entries: [{ m, day, index }],
        });
      }
    });
    return out;
  }, [items, order, total]);

  const openPhoto = useCallback(
    (paths: string[], index: number, alt: string) =>
      setLightbox({ paths, index, alt }),
    [],
  );

  const initialLoading = total === null && !error;
  const empty = total === 0 && !error;
  const done = items.length > 0 && !hasMore && !error;

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

        <div className="mt-6 flex h-9 items-center justify-center">
          {firstDate && total ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/70 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#9a7080]">
              <Heart size={12} className="text-rose-400" />
              Since {formatShortDate(firstDate)}
              <span aria-hidden>·</span>
              {total} {total === 1 ? "chapter" : "chapters"}
            </p>
          ) : null}
        </div>

        {(total ?? 0) >= 2 && (
          <div
            role="group"
            aria-label="Sort chapters"
            className="mx-auto mt-5 inline-flex rounded-full border border-rose-200 bg-white/70 p-1 shadow-sm"
          >
            {(["oldest", "newest"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => changeOrder(o)}
                aria-pressed={order === o}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  order === o
                    ? "bg-rose-500 text-white shadow"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                {o === "oldest" ? "Oldest first" : "Newest first"}
              </button>
            ))}
          </div>
        )}
      </header>

      <div ref={feedTopRef} className="mx-auto mt-10 w-full max-w-xl scroll-mt-4">
        {actionError && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700"
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
            className="rounded-3xl border border-red-200 bg-red-50/80 p-6 text-center"
          >
            <p className="font-medium text-red-700">
              Couldn&rsquo;t load the story
            </p>
            <p className="mt-1 font-mono text-xs text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => loadMore()}
              className="mt-4 rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-rose-600"
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

        {(initialLoading || items.length > 0) && (
          <div className="relative pl-9">
            <div
              aria-hidden
              className={`pointer-events-none absolute left-[13px] top-0 w-px bg-gradient-to-b from-rose-200 to-rose-200/70 ${
                done ? "bottom-5" : "bottom-0"
              }`}
            />

            {initialLoading && (
              <div role="status" className="space-y-8">
                <span className="sr-only">Loading our story…</span>
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {groups.map((group) => (
              <section key={group.key} aria-label={group.label}>
                <h2 className="sticky top-3 z-20 mb-5 flex h-8 items-center">
                  <span
                    aria-hidden
                    className="absolute -left-[31.5px] h-[18px] w-[18px] rounded-full border-[3px] border-white bg-rose-500 shadow"
                  />
                  <span className="rounded-full border border-rose-200 bg-white/95 px-4 py-1 font-serif text-base italic text-[#7a3a52] shadow-sm backdrop-blur-md">
                    {group.label}
                  </span>
                </h2>
                <ol className="space-y-8 pb-8">
                  {group.entries.map(({ m, day, index }) => (
                    <li
                      key={m.id}
                      className="story-rise relative"
                      style={{ animationDelay: `${(index % PAGE_SIZE) * 70}ms` }}
                    >
                      <span
                        aria-hidden
                        className="absolute -left-[28.5px] top-[22px] h-3 w-3 rounded-full border-2 border-white bg-rose-300 shadow-sm"
                      />
                      <ChapterCard
                        m={m}
                        day={day}
                        unlocked={unlocked}
                        deleting={deletingId === m.id}
                        onEdit={() => setEditing(m)}
                        onDelete={() => onDelete(m)}
                        onOpenPhoto={openPhoto}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            {hasMore && <div ref={sentinelRef} aria-hidden className="h-px" />}

            {loadingMore && items.length > 0 && (
              <div role="status" className="pb-8">
                <span className="sr-only">Loading more chapters…</span>
                <SkeletonCard />
              </div>
            )}

            {error && items.length > 0 && (
              <div role="alert" className="pb-8 text-center">
                <p className="text-sm text-red-700">
                  Couldn&rsquo;t load more chapters.
                </p>
                <button
                  type="button"
                  onClick={() => loadMore()}
                  className="mt-3 rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-rose-600"
                >
                  Try again
                </button>
              </div>
            )}

            {done && (
              <div className="relative flex h-10 items-center">
                <span
                  aria-hidden
                  className="absolute -left-[31.5px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#fdf1f1] text-rose-500"
                >
                  <Heart size={14} />
                </span>
                <p className="font-serif text-sm italic text-[#9a7080]">
                  {order === "oldest"
                    ? "…to be continued"
                    : "…and that's where it all began"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {unlocked && typeof document !== "undefined" &&
        createPortal(
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="fixed right-5 z-30 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-3.5 text-sm font-medium text-white shadow-[0_12px_28px_-8px_rgba(225,29,72,0.55)] transition hover:bg-rose-600 active:scale-95"
            style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <Plus size={18} />
            Add chapter
          </button>,
          document.body,
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

function SkeletonCard() {
  return (
    <div
      aria-hidden
      className="animate-pulse rounded-3xl border border-white bg-white/70 p-2 shadow-[0_12px_32px_-14px_rgba(180,80,110,0.2)]"
    >
      <div className="space-y-2 px-3 pb-3 pt-3">
        <div className="h-2.5 w-16 rounded-full bg-rose-100" />
        <div className="h-2 w-28 rounded-full bg-rose-100/70" />
      </div>
      <div className="aspect-[4/5] rounded-2xl bg-rose-100/70" />
      <div className="space-y-2.5 px-3 pb-3 pt-4">
        <div className="h-5 w-2/3 rounded-full bg-rose-100" />
        <div className="h-3 w-full rounded-full bg-rose-100/70" />
        <div className="h-3 w-5/6 rounded-full bg-rose-100/70" />
      </div>
    </div>
  );
}
