"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { imageUrl, type Moment } from "@/lib/supabase";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import OwnerMenu from "./OwnerMenu";
import PhotoCarousel from "./PhotoCarousel";
import { ArrowLeft, ArrowRight, Close } from "./icons";
import { formatCardDate } from "./utils";

// Full-screen reader for one chapter. Portaled to <body>: a lingering ancestor
// transform would otherwise shrink `fixed inset-0` to that ancestor (see
// CLAUDE.md, modal pattern).
export default function ChapterReader({
  m,
  day,
  total,
  prevDay,
  nextDay,
  nextLoading,
  unlocked,
  lightboxOpen,
  onClose,
  onPrev,
  onNext,
  onEdit,
  onDelete,
  onOpenPhoto,
}: {
  m: Moment;
  day: number;
  total: number;
  prevDay: number | null;
  nextDay: number | null;
  nextLoading: boolean;
  unlocked: boolean;
  lightboxOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenPhoto: (paths: string[], index: number, alt: string) => void;
}) {
  const photos = m.image_paths ?? [];
  const alt = m.title ?? "A chapter of our story";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dep-less on purpose: callbacks are inline arrows at the call site.
  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [m.id]);

  // The lightbox handles its own keys while it's open.
  useEffect(() => {
    if (lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, onClose, onPrev, onNext]);

  if (typeof document === "undefined") return null;

  const navButton =
    "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Day ${day}${m.title ? `: ${m.title}` : ""}`}
      className="story-pop fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#2b1722]"
    >
      {/* Atmosphere: the chapter's own photo, blurred, under a plum wash */}
      {photos[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl(photos[0])}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-3xl"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,114,182,0.28),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.14),transparent_60%)]"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#3a2030]/70 via-[#3a2030]/45 to-[#2b1722]/90"
      />

      <div
        className="relative z-20 flex items-center justify-between gap-3 px-3 pb-1"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="rounded-full p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <Close size={20} />
        </button>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
          Day {day} <span className="text-white/40">of</span> {total}
        </p>
        {unlocked ? (
          <OwnerMenu tone="dark" onEdit={onEdit} onDelete={onDelete} />
        ) : (
          <span className="w-11" aria-hidden />
        )}
      </div>

      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-3"
      >
        {/* min-h-full + justify-center: a short note sits mid-screen instead of
            floating at the top of an empty one */}
        <div
          key={m.id}
          className="story-rise mx-auto flex min-h-full w-full max-w-xl flex-col justify-center"
        >
          {photos.length > 0 && (
            <PhotoCarousel
              photos={photos}
              alt={alt}
              maxHeight="62vh"
              className="rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
              onOpen={(i) => onOpenPhoto(photos, i, alt)}
            />
          )}

          <article
            className={`relative rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50 to-pink-100 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-8 ${
              photos.length > 0 ? "mt-5" : "mt-2"
            }`}
          >
            <div
              aria-hidden
              className="absolute inset-x-8 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300 opacity-70"
            />
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 flex-col-reverse items-center justify-center rounded-2xl border border-rose-200/60 bg-white/70">
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-rose-500">
                  Day
                </span>
                <span className="font-serif text-3xl font-semibold leading-none tabular-nums text-rose-700">
                  {day}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#7a5560]">
                  {formatCardDate(m.occurred_at)}
                </p>
                {day === 1 && (
                  <p className="font-serif text-sm italic text-[#9a7080]">
                    where it began
                  </p>
                )}
              </div>
            </div>

            {m.title && (
              <h2 className="mt-5 font-serif text-3xl font-light leading-tight tracking-tight text-[#3a2030] sm:text-4xl">
                {m.title}
              </h2>
            )}
            {m.note && (
              <p
                className={`whitespace-pre-wrap font-serif leading-relaxed text-[#3a2030] ${
                  m.title
                    ? "mt-4 text-lg sm:text-xl"
                    : photos.length > 0
                      ? "mt-5 text-xl italic sm:text-2xl"
                      : "mt-6 text-2xl italic sm:text-3xl"
                }`}
              >
                {m.note}
              </p>
            )}
          </article>
        </div>
      </div>

      <div
        className="relative z-20 border-t border-white/10 bg-[#2b1722]/70 px-4 pt-3 backdrop-blur-md"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={prevDay === null}
            className={navButton}
          >
            <ArrowLeft size={16} />
            {prevDay !== null ? `Day ${prevDay}` : "Start"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={nextDay === null}
            className={navButton}
          >
            {nextDay !== null
              ? `Day ${nextDay}`
              : nextLoading
                ? "Loading…"
                : "End"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
