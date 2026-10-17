"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { imageUrl } from "@/lib/supabase";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { Close } from "./icons";
import type { OverviewMeeting } from "./useStoryOverview";
import { formatLongDate, formatWeekday } from "./utils";

// What a tapped calendar day opens: a small preview of that day's chapter(s)
// with a way into the full story. A bottom sheet on phones, a centred card from
// `sm` up. Portaled to <body> like the other overlays (see CLAUDE.md, modal
// pattern), with the same scroll-overlay structure.
export default function DaySheet({
  meetings,
  onClose,
  onRead,
}: {
  meetings: OverviewMeeting[];
  onClose: () => void;
  onRead: (momentId: string) => void;
}) {
  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (meetings.length === 0 || typeof document === "undefined") return null;
  const when = meetings[0].occurredAt;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={formatLongDate(when)}
          onClick={(e) => e.stopPropagation()}
          className="story-rise w-full max-w-md rounded-t-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50 to-pink-50 p-5 shadow-[0_-20px_60px_-20px_rgba(180,80,110,0.45)] sm:rounded-3xl sm:p-6"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-rose-500">
                {formatWeekday(when)}
              </p>
              <h3 className="mt-1 font-serif text-3xl font-light leading-tight text-[#3a2030]">
                {formatLongDate(when)}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full bg-white/70 p-2 text-[#7a5560] transition hover:bg-white"
            >
              <Close size={18} />
            </button>
          </div>

          <ul className="mt-5 space-y-4">
            {meetings.map((m) => (
              <li key={m.momentId} className="rounded-2xl border border-rose-200/60 bg-white/70 p-3.5">
                <div className="flex gap-3">
                  {m.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl(m.cover)}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-serif text-xl leading-snug text-[#3a2030]">
                      {m.title ?? "A day together"}
                    </p>
                    {m.excerpt && (
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#7a5560]">
                        {m.excerpt}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRead(m.momentId);
                    onClose();
                  }}
                  className="mt-3 w-full rounded-full bg-rose-500 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-rose-600 active:scale-[0.98]"
                >
                  Read this chapter →
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
