"use client";

import { useEffect, useRef, useState } from "react";
import type { Moment } from "@/lib/supabase";
import PhotoCarousel from "./PhotoCarousel";
import { Dots, Pencil, Trash } from "./icons";
import { formatCardDate } from "./utils";

export default function ChapterCard({
  m,
  day,
  unlocked,
  deleting,
  onEdit,
  onDelete,
  onOpenPhoto,
}: {
  m: Moment;
  day: number;
  unlocked: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onOpenPhoto: (paths: string[], index: number, alt: string) => void;
}) {
  const photos = m.image_paths ?? [];
  const hasPhotos = photos.length > 0;
  const alt = m.title ?? "A chapter of our story";

  return (
    <article
      className={`relative rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/80 to-pink-100/60 p-2 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] transition ${
        deleting ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {/* Same top accent bar as the countdown cards */}
      <div
        aria-hidden
        className="absolute inset-x-8 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300 opacity-70"
      />

      <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-2.5">
        <div className="flex min-w-0 items-center gap-3.5">
          {/* The countdown tiles' look: serif numeral over a tiny tracked label.
              DOM order is label → numeral (reads "Day 7"); flex-col-reverse
              puts the numeral on top. */}
          <div className="flex h-14 w-14 shrink-0 flex-col-reverse items-center justify-center rounded-2xl border border-rose-200/60 bg-white/70">
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-rose-500">
              Day
            </span>
            <span className="font-serif text-3xl font-semibold leading-none tabular-nums text-rose-700">
              {day}
            </span>
          </div>
          <div className="min-w-0">
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
        {unlocked && <CardMenu onEdit={onEdit} onDelete={onDelete} />}
      </div>

      {hasPhotos && (
        <PhotoCarousel
          photos={photos}
          alt={alt}
          onOpen={(i) => onOpenPhoto(photos, i, alt)}
        />
      )}

      {(m.title || m.note) && (
        <div className={`px-2 pb-3 ${hasPhotos ? "pt-4" : "pt-1"}`}>
          {m.title && (
            <h3 className="font-serif text-2xl font-medium leading-tight text-[#3a2030]">
              {m.title}
            </h3>
          )}
          {m.note && (
            <ExpandableNote
              text={m.note}
              // A note with no photo is the whole chapter, so let it breathe.
              prominent={!hasPhotos}
              className={m.title ? "mt-2" : ""}
            />
          )}
        </div>
      )}
    </article>
  );
}

function ExpandableNote({
  text,
  prominent,
  className = "",
}: {
  text: string;
  prominent: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    // Web fonts land after first paint and can change how the text wraps.
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text, expanded]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={`whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"} ${
          prominent
            ? "font-serif text-lg italic leading-relaxed text-[#4a2c3c]"
            : "text-sm leading-relaxed text-[#5a3a4a]"
        }`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-500 transition hover:text-rose-700"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function CardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setConfirming(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(false);
        }}
        aria-label="Chapter options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full p-2 text-[#9a7080] transition hover:bg-white/70 hover:text-rose-600"
      >
        <Dots />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-48 rounded-2xl border border-rose-100 bg-white p-1.5 shadow-xl"
        >
          {confirming ? (
            <div className="p-2">
              <p className="mb-2.5 text-sm text-[#3a2030]">
                Delete this chapter?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-[#7a5560] transition hover:bg-rose-50"
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirming(false);
                    onDelete();
                  }}
                  className="flex-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className={`${item} text-[#3a2030] hover:bg-rose-50`}
              >
                <Pencil size={15} /> Edit chapter
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(true)}
                className={`${item} text-rose-600 hover:bg-rose-50`}
              >
                <Trash size={15} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
