"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  supabase,
  imageUrl,
  MAX_PHOTOS_PER_CHAPTER,
  type Moment,
} from "@/lib/supabase";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import PlacePicker, { type PlaceValue } from "./PlacePicker";
import { Close, Plus } from "./icons";
import { extractErrorMessage, toDateInputValue } from "./utils";

const inputClass =
  "w-full rounded-2xl border border-rose-200 bg-white/70 px-4 py-3 text-base text-[#3a2030] placeholder:text-[#b79aa6] focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 sm:text-sm";

// Portaled to <body> (see CLAUDE.md, modal pattern). Bottom sheet on phones,
// centered dialog from `sm` up. The outer overlay scrolls; the inner wrapper
// centers when there's room and top-aligns when there isn't — don't flatten
// this into one `flex items-center overflow-y-auto` div.
export default function ChapterForm({
  existing,
  placesEnabled = false,
  onClose,
  onSaved,
}: {
  existing?: Moment;
  // Whether supabase/places.sql has been run. Place fields are only shown and
  // only sent when it has — otherwise the write would fail on missing columns.
  placesEnabled?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!existing;
  const originalPaths = existing?.image_paths ?? [];

  const [date, setDate] = useState(
    toDateInputValue(existing ? new Date(existing.occurred_at) : new Date()),
  );
  const [title, setTitle] = useState(existing?.title ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [keptPaths, setKeptPaths] = useState<string[]>(originalPaths);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [place, setPlace] = useState<PlaceValue>({
    name: existing?.place_name ?? "",
    lat: existing?.lat ?? null,
    lng: existing?.lng ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoCount = keptPaths.length + newFiles.length;
  const canAddMore = photoCount < MAX_PHOTOS_PER_CHAPTER;

  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const remaining = MAX_PHOTOS_PER_CHAPTER - photoCount;
    setNewFiles((current) => [...current, ...picked.slice(0, remaining)]);
    e.target.value = "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !note.trim() && photoCount === 0) {
      setError("Add a title, a note, or a photo — at least one.");
      return;
    }
    setSaving(true);
    setError(null);

    const uploaded: string[] = [];
    try {
      for (const f of newFiles) {
        const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from("moments")
          .upload(path, f, { cacheControl: "3600", upsert: false });
        if (up.error) throw up.error;
        uploaded.push(path);
      }

      const payload = {
        occurred_at: new Date(`${date}T12:00:00`).toISOString(),
        title: title.trim() || null,
        note: note.trim() || null,
        image_paths: [...keptPaths, ...uploaded].slice(
          0,
          MAX_PHOTOS_PER_CHAPTER,
        ),
        ...(placesEnabled
          ? {
              place_name: place.name.trim() || null,
              lat: place.lat,
              lng: place.lng,
            }
          : {}),
      };

      const res =
        isEdit && existing
          ? await supabase.from("moments").update(payload).eq("id", existing.id)
          : await supabase.from("moments").insert(payload);
      if (res.error) throw res.error;

      // Only now that the row points at the new photos is it safe to drop the
      // ones the user removed; a failure here just leaves an orphaned file.
      const removed = originalPaths.filter((p) => !keptPaths.includes(p));
      if (removed.length > 0) {
        await supabase.storage.from("moments").remove(removed);
      }

      onSaved();
    } catch (err) {
      // Don't leave this attempt's uploads behind in the bucket.
      if (uploaded.length > 0) {
        await supabase.storage.from("moments").remove(uploaded);
      }
      setError(extractErrorMessage(err));
      setSaving(false);
    }
  };

  const closeOnBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#3a2030]/40 backdrop-blur-sm"
      onClick={closeOnBackdrop}
    >
      <div
        className="flex min-h-full items-end justify-center sm:items-center sm:p-4"
        onClick={closeOnBackdrop}
      >
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-t-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-6 pb-8 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.35)] sm:rounded-3xl sm:p-8"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
            {isEdit ? "edit chapter" : "a new chapter"}
          </p>
          <h2 className="mb-6 font-serif text-3xl font-light tracking-tight text-[#3a2030]">
            {isEdit ? "Reshape this memory" : "Another day with Pallavi"}
          </h2>

          <div className="space-y-4">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Title (optional)">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A walk by the lake"
                maxLength={120}
                className={inputClass}
              />
            </Field>
            <Field label="Note (optional)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What did this day feel like?"
                maxLength={1000}
                className={`${inputClass} resize-none leading-relaxed`}
              />
            </Field>

            {placesEnabled && (
              <PlacePicker
                value={place}
                onChange={setPlace}
                inputClass={inputClass}
              />
            )}

            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.22em] text-rose-600">
                Photos · {photoCount}/{MAX_PHOTOS_PER_CHAPTER}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {keptPaths.map((path) => (
                  <Thumb
                    key={path}
                    src={imageUrl(path)}
                    onRemove={() =>
                      setKeptPaths((p) => p.filter((x) => x !== path))
                    }
                  />
                ))}
                {newFiles.map((f, idx) => (
                  <PendingThumb
                    key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                    file={f}
                    onRemove={() =>
                      setNewFiles((arr) => arr.filter((_, i) => i !== idx))
                    }
                  />
                ))}
                {canAddMore && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose-200 bg-white/70 text-rose-500 transition hover:border-rose-300 hover:bg-white">
                    <Plus size={20} />
                    <span className="text-[10px] font-medium uppercase tracking-wide">
                      Add
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onPickFiles}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
              {!canAddMore && (
                <p className="mt-2 text-xs italic text-[#9a7080]">
                  Limit reached. Remove a photo to add a different one.
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full px-5 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#7a5560] transition hover:text-[#3a2030] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-rose-500 px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Save chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.22em] text-rose-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove photo"
      title="Remove"
      className="absolute right-1 top-1 rounded-full bg-white/95 p-1 text-rose-600 shadow-md transition hover:bg-white"
    >
      <Close size={12} />
    </button>
  );
}

function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-rose-200 bg-rose-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      <RemoveButton onRemove={onRemove} />
    </div>
  );
}

// Object URLs are created once per file and revoked on unmount, instead of a
// fresh (leaked) blob URL on every render.
function PendingThumb({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="h-full w-full object-cover" />
      )}
      <span className="absolute bottom-1 left-1 rounded bg-white/85 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-rose-700">
        new
      </span>
      <RemoveButton onRemove={onRemove} />
    </div>
  );
}
