"use client";

import { useState } from "react";
import { Calendar } from "./icons";
import { extractErrorMessage, formatLongDate, toDateInputValue } from "./utils";

const inputClass =
  "w-full rounded-2xl border border-rose-200 bg-white/70 px-4 py-3 text-base text-[#3a2030] focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 sm:text-sm";

// Owner-only, inline under the "Since we last met" counter: pick the date we
// last met with the native calendar, without having to write a chapter first.
// The counter counts from the later of this date and the latest chapter, so a
// date no newer than the latest chapter can't change anything — say so instead
// of saving a no-op.
export default function LastMetEditor({
  chapterAt,
  manual,
  onSave,
  onClear,
}: {
  /** Date of the latest chapter (ISO), if any. */
  chapterAt: string | null;
  /** The date set here, YYYY-MM-DD, if any. */
  manual: string | null;
  onSave: (date: string) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = toDateInputValue(new Date());
  const chapterDay = chapterAt ? toDateInputValue(new Date(chapterAt)) : null;
  const tooOld = value !== "" && chapterDay !== null && value <= chapterDay;
  const inFuture = value > today;

  const openPanel = () => {
    setValue(manual ?? today);
    setError(null);
    setOpen(true);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setOpen(false);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={openPanel}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-white/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-700 transition hover:bg-white"
        >
          <Calendar size={13} />
          Update last met
        </button>
      </div>
    );
  }

  return (
    <form
      className="mx-auto mt-5 w-full max-w-sm rounded-2xl border border-rose-200/80 bg-white/70 p-4 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value || tooOld || inFuture) return;
        run(() => onSave(value));
      }}
    >
      <label
        htmlFor="last-met-date"
        className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-rose-600"
      >
        When did we last meet?
      </label>
      <input
        id="last-met-date"
        type="date"
        required
        max={today}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={inputClass}
      />

      {tooOld && chapterAt && (
        <p className="mt-2 text-xs leading-relaxed text-[#7a5560]">
          Your latest chapter ({formatLongDate(chapterAt)}) is already that recent, so the
          counter counts from it. Pick a later date, or edit that chapter&rsquo;s date.
        </p>
      )}
      {inFuture && <p className="mt-2 text-xs text-[#7a5560]">That day hasn&rsquo;t happened yet.</p>}
      {error && (
        <p role="alert" className="mt-2 font-mono text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={busy || !value || tooOld || inFuture}
          className="rounded-full bg-rose-500 px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9a7080] transition hover:text-rose-700"
        >
          Cancel
        </button>
        {manual && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onClear)}
            className="ml-auto text-xs font-medium text-rose-600 underline-offset-2 hover:underline"
          >
            Use my latest chapter
          </button>
        )}
      </div>
    </form>
  );
}
