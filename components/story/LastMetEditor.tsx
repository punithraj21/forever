"use client";

import { useState } from "react";
import type { Moment } from "@/lib/supabase";
import { Calendar } from "./icons";
import { extractErrorMessage, formatLongDate, toDateInputValue } from "./utils";

const inputClass =
  "w-full rounded-2xl border border-rose-200 bg-white/70 px-4 py-3 text-base text-[#3a2030] focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 sm:text-sm";

// Owner-only, inline under the "Since we last met" counter. The counter always
// runs from the latest chapter, so to record a meeting we haven't written up yet
// this adds a placeholder chapter on that day ("We met") — a real entry that can
// be edited later to add the story and photos, and that the counter, the gaps
// and the numbers all pick up like any other. A date no newer than the latest
// chapter couldn't change the counter, so it's refused with a pointer to the
// regular Add chapter.
export default function LastMetEditor({
  chapterAt,
  onAdd,
  onWrite,
}: {
  /** Date of the latest chapter (ISO), if any. */
  chapterAt: string | null;
  /** Creates the placeholder chapter for a YYYY-MM-DD date. */
  onAdd: (date: string) => Promise<Moment>;
  /** Opens a chapter for editing. */
  onWrite: (m: Moment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Moment | null>(null);

  const today = toDateInputValue(new Date());
  const chapterDay = chapterAt ? toDateInputValue(new Date(chapterAt)) : null;
  const tooOld = value !== "" && chapterDay !== null && value <= chapterDay;
  const inFuture = value > today;

  const openPanel = () => {
    setValue(today);
    setError(null);
    setAdded(null);
    setOpen(true);
  };

  const submit = async () => {
    if (!value || tooOld || inFuture) return;
    setBusy(true);
    setError(null);
    try {
      setAdded(await onAdd(value));
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

  if (added) {
    return (
      <div
        role="status"
        className="mx-auto mt-5 w-full max-w-sm rounded-2xl border border-rose-200/80 bg-white/70 p-4 text-center"
      >
        <p className="font-serif text-lg text-[#3a2030]">
          Added: {formatLongDate(added.occurred_at)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#7a5560]">
          A &ldquo;We met&rdquo; chapter now marks that day. Edit it any time to add the story
          and photos.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              onWrite(added);
              setOpen(false);
            }}
            className="rounded-full bg-rose-500 px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-rose-600"
          >
            Write it now
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9a7080] transition hover:text-rose-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mx-auto mt-5 w-full max-w-sm rounded-2xl border border-rose-200/80 bg-white/70 p-4 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
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
      <p className="mt-2 text-xs leading-relaxed text-[#9a7080]">
        Adds a &ldquo;We met&rdquo; chapter on that day, so the counter and the story stay in
        step. You can write it up later.
      </p>

      {tooOld && chapterAt && (
        <p className="mt-2 text-xs leading-relaxed text-[#7a5560]">
          Your latest chapter ({formatLongDate(chapterAt)}) is already that recent. To record an
          earlier meeting, use Add chapter.
        </p>
      )}
      {inFuture && <p className="mt-2 text-xs text-[#7a5560]">That day hasn&rsquo;t happened yet.</p>}
      {error && (
        <p role="alert" className="mt-2 font-mono text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || !value || tooOld || inFuture}
          className="rounded-full bg-rose-500 px-5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#9a7080] transition hover:text-rose-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
