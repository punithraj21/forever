"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, type Moment } from "@/lib/supabase";
import ChapterForm from "./ChapterForm";
import ChapterList from "./ChapterList";
import GalleryTab from "./GalleryTab";
import Lightbox from "./Lightbox";
import PlacesTab from "./PlacesTab";
import StoryNumbers from "./StoryNumbers";
import StoryTabs, {
  SortToggle,
  TABS_AT_BOTTOM,
  type TabDef,
  type TabId,
} from "./StoryTabs";
import SinceLastMet from "./SinceLastMet";
import { Plus } from "./icons";
import { useStoryFeed } from "./useStoryFeed";
import { useStoryOverview, type OverviewPhoto } from "./useStoryOverview";
import { extractErrorMessage, formatShortDate, type SortOrder } from "./utils";

const UNLOCK_KEY = "moments_unlocked";

type LightboxState = {
  paths: string[];
  index: number;
  alt: string;
  captions?: string[];
  action?: { label: string; onClick: (index: number) => void };
};

export default function StoryPage() {
  const [tab, setTab] = useState<TabId>("story");
  const [order, setOrder] = useState<SortOrder>("oldest");
  const [unlocked, setUnlocked] = useState(false);
  const [editing, setEditing] = useState<Moment | "new" | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingJump, setPendingJump] = useState<string | null>(null);
  const contentTopRef = useRef<HTMLDivElement>(null);

  const feed = useStoryFeed(order);
  const { overview, refreshOverview } = useStoryOverview();
  const { items, total, hasMore, fetching, error, loadMore, reload } = feed;

  useEffect(() => {
    setUnlocked(localStorage.getItem(UNLOCK_KEY) === "true");
    // Deep links: /moments#photos, /moments#places
    const hash = window.location.hash.replace("#", "");
    if (hash === "photos" || hash === "places") setTab(hash);
  }, []);

  const showPlacesTab = unlocked || (overview?.places.length ?? 0) > 0;
  const tabs: TabDef[] = [
    { id: "story", label: "Story" },
    { id: "photos", label: "Photos" },
    ...(showPlacesTab ? [{ id: "places" as const, label: "Places" }] : []),
  ];

  const changeTab = (next: TabId) => {
    if (next === tab) return;
    setTab(next);
    history.replaceState(null, "", next === "story" ? location.pathname : `#${next}`);
    contentTopRef.current?.scrollIntoView({ block: "start" });
  };

  const changeOrder = (next: SortOrder) => {
    if (next === order) return;
    setOrder(next);
    contentTopRef.current?.scrollIntoView({ block: "start" });
  };

  // "Read this chapter →" from the gallery or the map: switch to the story and
  // keep paging until that chapter exists, then scroll to it.
  const jumpToChapter = useCallback((momentId: string) => {
    setLightbox(null);
    setTab("story");
    history.replaceState(null, "", location.pathname);
    setPendingJump(momentId);
  }, []);

  useEffect(() => {
    if (!pendingJump || tab !== "story") return;
    const el = document.getElementById(`chapter-${pendingJump}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingJump(null);
    } else if (hasMore && !fetching && !error) {
      loadMore();
    } else if (!hasMore && !fetching) {
      setPendingJump(null); // not found (e.g. since deleted)
    }
  }, [pendingJump, tab, items.length, hasMore, fetching, error, loadMore]);

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
      await Promise.all([reload(), refreshOverview()]);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const openChapterPhotos = useCallback(
    (paths: string[], index: number, alt: string) =>
      setLightbox({ paths, index, alt }),
    [],
  );

  const openGallery = useCallback(
    (index: number, list: OverviewPhoto[]) =>
      setLightbox({
        paths: list.map((p) => p.path),
        index,
        alt: "Our photos",
        captions: list.map(
          (p) => `${formatShortDate(p.occurredAt)}${p.title ? ` · ${p.title}` : ""}`,
        ),
        action: {
          label: "Read this one →",
          onClick: (i) => jumpToChapter(list[i].momentId),
        },
      }),
    [jumpToChapter],
  );

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
      </header>

      <div className="mx-auto mt-10 max-w-2xl">
        <SinceLastMet
          lastAt={overview?.lastDate ?? null}
          lastTitle={overview?.lastTitle ?? null}
        />
        <StoryNumbers
          moments={overview?.total ?? total}
          photos={overview?.photoCount ?? null}
          longestGapDays={overview?.longestGapDays ?? null}
        />
      </div>

      <div className="mt-12">
        <StoryTabs
          tabs={tabs}
          tab={tab}
          onTab={changeTab}
        />
      </div>

      <div
        ref={contentTopRef}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className={`mt-4 sm:mt-8 ${TABS_AT_BOTTOM ? "scroll-mt-4" : "scroll-mt-14"}`}
      >
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

        {tab === "story" && (
          <div className="mx-auto mb-2 flex max-w-2xl items-center justify-between gap-3 sm:mb-4">
            {unlocked ? (
              <button
                type="button"
                onClick={() => setEditing("new")}
                className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-rose-500 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white shadow-[0_8px_18px_-8px_rgba(225,29,72,0.55)] transition hover:bg-rose-600 active:scale-95"
              >
                <Plus size={13} />
                Add chapter
              </button>
            ) : (
              <span />
            )}
            {(overview?.total ?? total ?? 0) > 1 && <SortToggle order={order} onOrder={changeOrder} />}
          </div>
        )}

        {tab === "story" && (
          <ChapterList
            feed={feed}
            order={order}
            unlocked={unlocked}
            deletingId={deletingId}
            onEdit={(m) => setEditing(m)}
            onDelete={onDelete}
            onOpenPhoto={openChapterPhotos}
          />
        )}

        {tab === "photos" &&
          (overview ? (
            <GalleryTab
              photos={overview.photos}
              order={order}
              sort={<SortToggle order={order} onOrder={changeOrder} />}
              onOpen={openGallery}
            />
          ) : (
            <p role="status" className="text-center text-sm italic text-[#9a7080]">
              Gathering photos…
            </p>
          ))}

        {tab === "places" &&
          (overview ? (
            <PlacesTab overview={overview} unlocked={unlocked} onRead={jumpToChapter} />
          ) : (
            <p role="status" className="text-center text-sm italic text-[#9a7080]">
              Finding our places…
            </p>
          ))}
      </div>

      {editing && (
        <ChapterForm
          existing={editing === "new" ? undefined : editing}
          placesEnabled={overview?.placesEnabled ?? false}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
            refreshOverview();
          }}
        />
      )}

      {lightbox && (
        <Lightbox
          paths={lightbox.paths}
          initialIndex={lightbox.index}
          alt={lightbox.alt}
          captions={lightbox.captions}
          action={lightbox.action}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
