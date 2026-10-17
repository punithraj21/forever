"use client";

import { useCallback, useRef, useState } from "react";
import { imageUrl } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "./icons";

// Portrait 3:4 is the common case (phone camera). The frame follows the first
// photo's own shape, clamped so a panorama or a tall screenshot can't blow
// the card up — nothing is cropped, the rest letterboxes over a blurred copy.
const DEFAULT_RATIO = 3 / 4;
const MIN_RATIO = 3 / 4;
const MAX_RATIO = 3 / 2;

export default function PhotoCarousel({
  photos,
  alt,
  onOpen,
}: {
  photos: string[];
  alt: string;
  onOpen: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const total = photos.length;

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      // w-full is load-bearing: with `width: auto`, the max-height clamp is
      // transferred through the aspect-ratio and shrinks the frame's width.
      className="relative w-full overflow-hidden rounded-2xl bg-rose-50"
      style={{ aspectRatio: ratio, maxHeight: "78vh" }}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((path, i) => (
          <div key={path} className="relative h-full w-full flex-none snap-center">
            {/* Blurred copy fills any letterbox space with the photo's own colors */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(path)}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
            />
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`View photo ${i + 1} full screen`}
              className="absolute inset-0 cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(path)}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={
                  i === 0
                    ? (e) => {
                        const { naturalWidth: w, naturalHeight: h } =
                          e.currentTarget;
                        if (w && h) {
                          setRatio(
                            Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h)),
                          );
                        }
                      }
                    : undefined
                }
                className="h-full w-full object-contain"
              />
            </button>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white backdrop-blur-sm">
            {Math.min(index, total - 1) + 1} / {total}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1.5 backdrop-blur-sm">
            {photos.map((path, i) => (
              <span
                key={path}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Arrows are for mouse users; touch devices swipe. */}
          {index > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-[#3a2030] shadow-md transition hover:bg-white [@media(hover:hover)]:block"
            >
              <ChevronLeft />
            </button>
          )}
          {index < total - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-[#3a2030] shadow-md transition hover:bg-white [@media(hover:hover)]:block"
            >
              <ChevronRight />
            </button>
          )}
        </>
      )}
    </div>
  );
}
