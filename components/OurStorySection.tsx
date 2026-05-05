"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import {
  supabase,
  imageUrl,
  MAX_PHOTOS_PER_CHAPTER,
  type Moment,
} from "@/lib/supabase";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";

const UNLOCK_KEY = "moments_unlocked";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OurStorySection() {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [editing, setEditing] = useState<Moment | "new" | null>(null);
  const [lightbox, setLightbox] = useState<{
    paths: string[];
    initial: number;
    alt: string;
  } | null>(null);
  const [detail, setDetail] = useState<{ m: Moment; day: number } | null>(null);

  const refresh = async () => {
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .order("occurred_at", { ascending: true });
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setMoments((data ?? []) as Moment[]);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlocked(localStorage.getItem(UNLOCK_KEY) === "true");
    }
    refresh();
  }, []);

  const onDelete = async (m: Moment) => {
    if (m.image_paths && m.image_paths.length > 0) {
      await supabase.storage.from("moments").remove(m.image_paths);
    }
    const { error } = await supabase.from("moments").delete().eq("id", m.id);
    if (error) {
      setError(error.message);
      return;
    }
    refresh();
  };

  const chapterCount = moments?.length ?? 0;
  // Query is ascending (Day 1 first), so the first chapter sets the "where it began" anchor.
  const firstMoment = moments && moments.length > 0 ? moments[0] : null;

  return (
    <section className="fade-in w-full">
      <div className="text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          chapter by chapter
        </p>
        <h3 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          Our Story
        </h3>
        <p className="mt-3 font-serif text-base italic text-[#7a5560] sm:text-lg">
          from the day we met
        </p>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </div>

      {firstMoment && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <DayBadge label="Day 1" big />
          <p className="font-serif text-base italic text-[#7a5560]">
            {formatShortDate(firstMoment.occurred_at)} — where it began
          </p>
          {chapterCount > 1 && (
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7080]">
              {chapterCount} chapters written so far
            </p>
          )}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        {unlocked && (
          <button
            onClick={() => setEditing("new")}
            type="button"
            className="rounded-full border border-rose-300 bg-white/70 px-6 py-2.5 text-sm font-medium text-rose-700 shadow-sm backdrop-blur-sm transition hover:bg-rose-100/80"
          >
            + Add a chapter
          </button>
        )}
      </div>

      {error && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
          <p className="font-medium">Couldn&rsquo;t load the story</p>
          <p className="mt-1 font-mono text-xs">{error}</p>
        </div>
      )}

      {moments === null && !error && (
        <p className="mt-12 text-center text-sm italic text-[#9a7080]">
          Loading our story…
        </p>
      )}

      {moments && moments.length === 0 && !error && (
        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-dashed border-rose-200 bg-white/40 p-10 text-center">
          <p className="font-serif text-xl italic text-[#7a5560]">
            The story is just beginning…
          </p>
          {unlocked && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rose-500">
              click &ldquo;+ Add a chapter&rdquo; above
            </p>
          )}
        </div>
      )}

      {moments && moments.length > 0 && (
        <div className="relative mt-14">
          <div
            className="pointer-events-none absolute bottom-0 left-[42px] top-0 w-px bg-gradient-to-b from-rose-300 via-rose-200 to-transparent sm:left-[78px]"
            aria-hidden
          />

          <div className="space-y-10">
            {moments.map((m, index) => {
              const day = index + 1;
              return (
                <ChapterRow
                  key={m.id}
                  m={m}
                  day={day}
                  unlocked={unlocked}
                  onEdit={() => setEditing(m)}
                  onDelete={() => onDelete(m)}
                  onOpenDetail={() => setDetail({ m, day })}
                  onViewImages={(paths, initial, alt) =>
                    setLightbox({ paths, initial, alt })
                  }
                />
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="h-10 w-px bg-gradient-to-b from-rose-200 to-transparent" />
            <p className="font-serif text-sm italic text-[#9a7080]">
              …to be continued
            </p>
          </div>
        </div>
      )}

      {editing && (
        <ChapterFormModal
          existing={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}

      {lightbox && (
        <Lightbox
          paths={lightbox.paths}
          initialIndex={lightbox.initial}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}

      {detail && (
        <ChapterDetailModal
          m={detail.m}
          day={detail.day}
          onClose={() => setDetail(null)}
          onViewImages={(paths, initial, alt) =>
            setLightbox({ paths, initial, alt })
          }
        />
      )}
    </section>
  );
}

function DayBadge({ label, big = false }: { label: string; big?: boolean }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border-2 border-rose-400 bg-white font-serif font-medium tracking-wide text-rose-600 shadow-md ${
        big ? "px-6 py-2 text-base sm:text-lg" : "px-4 py-1 text-xs sm:text-sm"
      }`}
    >
      {label}
    </div>
  );
}

function ChapterRow({
  m,
  day,
  unlocked,
  onEdit,
  onDelete,
  onOpenDetail,
  onViewImages,
}: {
  m: Moment;
  day: number;
  unlocked: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onOpenDetail: () => void;
  onViewImages: (paths: string[], initial: number, alt: string) => void;
}) {
  const date = formatDate(m.occurred_at);
  const photos = m.image_paths ?? [];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const total = photos.length;
  const safeIndex = total > 0 ? carouselIndex % total : 0;

  return (
    <div className="relative grid grid-cols-[80px_1fr] gap-4 sm:grid-cols-[150px_1fr] sm:gap-8">
      <div className="relative flex flex-col items-center pt-2">
        <div className="relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full border-[3px] border-white bg-rose-500 font-serif text-xs font-semibold text-white shadow-md sm:h-[42px] sm:w-[42px] sm:text-sm">
          {day}
        </div>
        <div className="mt-2 hidden text-center text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500 sm:block">
          Event {day}
        </div>
        <div className="mt-1 hidden text-center text-[10px] text-[#7a5560] sm:block">
          {date}
        </div>
      </div>

      <article className="group relative overflow-hidden rounded-2xl border border-rose-200/60 bg-white/80 shadow-[0_10px_30px_-12px_rgba(180,80,110,0.25)] backdrop-blur-sm transition hover:shadow-[0_20px_40px_-15px_rgba(180,80,110,0.35)]">
        {total > 0 && (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-rose-50">
            {/* Soft blurred copy fills the letterbox space with the image's own colors */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(photos[safeIndex])}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
            />
            <button
              type="button"
              onClick={() =>
                onViewImages(photos, safeIndex, m.title ?? "A chapter")
              }
              className="relative block h-full w-full cursor-zoom-in"
              aria-label="View photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(photos[safeIndex])}
                alt={m.title ?? "A chapter"}
                className="h-full w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </button>

            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarouselIndex((i) => (i - 1 + total) % total);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-[#3a2030] shadow-md transition hover:bg-white"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarouselIndex((i) => (i + 1) % total);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-[#3a2030] shadow-md transition hover:bg-white"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Show photo ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === safeIndex
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                  {safeIndex + 1} / {total}
                </div>
              </>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={onOpenDetail}
          className="block w-full cursor-pointer p-5 text-left transition hover:bg-rose-50/40 sm:p-6"
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-rose-500 sm:hidden">
            Day {day} · {date}
          </div>
          {m.title && (
            <h4 className="mt-1 font-serif text-2xl font-medium leading-tight text-[#3a2030] sm:mt-0">
              {m.title}
            </h4>
          )}
          {m.note && (
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-[#5a3a4a]">
              {m.note}
            </p>
          )}
          <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em] text-rose-500 opacity-70 transition group-hover:opacity-100">
            Read full chapter →
          </span>
        </button>

        {unlocked && (
          <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
            <IconButton onClick={onEdit} label="Edit" tone="neutral">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </IconButton>
            <IconButton
              onClick={() => {
                if (confirm("Delete this chapter?")) onDelete();
              }}
              label="Delete"
              tone="danger"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </IconButton>
          </div>
        )}
      </article>
    </div>
  );
}

function IconButton({
  onClick,
  label,
  tone,
  children,
}: {
  onClick: () => void;
  label: string;
  tone: "neutral" | "danger";
  children: React.ReactNode;
}) {
  const color = tone === "danger" ? "text-rose-600" : "text-[#3a2030]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-full bg-white/90 p-1.5 ${color} shadow-md backdrop-blur-sm transition hover:bg-white`}
    >
      {children}
    </button>
  );
}

function ChapterFormModal({
  existing,
  onClose,
  onSaved,
}: {
  existing?: Moment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialDate = existing
    ? new Date(existing.occurred_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [keptPaths, setKeptPaths] = useState<string[]>(
    existing?.image_paths ?? [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!existing;
  const originalPaths = existing?.image_paths ?? [];
  const photoCount = keptPaths.length + newFiles.length;
  const willHavePhoto = photoCount > 0;
  const canAddMore = photoCount < MAX_PHOTOS_PER_CHAPTER;

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const remaining = MAX_PHOTOS_PER_CHAPTER - photoCount;
    setNewFiles((current) => [...current, ...picked.slice(0, remaining)]);
    e.target.value = "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !note.trim() && !willHavePhoto) {
      setError("Add a title, a note, or a photo — at least one.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      // Delete photos the user removed (originals not in keptPaths)
      const removedPaths = originalPaths.filter((p) => !keptPaths.includes(p));
      if (removedPaths.length > 0) {
        await supabase.storage.from("moments").remove(removedPaths);
      }

      // Upload new files
      const uploadedPaths: string[] = [];
      for (const f of newFiles) {
        const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from("moments")
          .upload(path, f, { cacheControl: "3600", upsert: false });
        if (up.error) throw up.error;
        uploadedPaths.push(path);
      }

      const finalPaths = [...keptPaths, ...uploadedPaths].slice(
        0,
        MAX_PHOTOS_PER_CHAPTER,
      );

      const occurred_at = new Date(`${date}T12:00:00`).toISOString();
      const payload = {
        occurred_at,
        title: title.trim() || null,
        note: note.trim() || null,
        image_paths: finalPaths,
      };

      if (isEdit && existing) {
        const upd = await supabase
          .from("moments")
          .update(payload)
          .eq("id", existing.id);
        if (upd.error) throw upd.error;
      } else {
        const ins = await supabase.from("moments").insert(payload);
        if (ins.error) throw ins.error;
      }

      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
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
        className="flex min-h-full items-center justify-center p-4"
        onClick={closeOnBackdrop}
      >
        <form
          onSubmit={onSubmit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-7 shadow-2xl"
        >
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-rose-500">
            {isEdit ? "edit chapter" : "a new chapter"}
          </p>
          <h4 className="mb-5 font-serif text-2xl font-medium text-[#3a2030]">
            {isEdit ? "Reshape this memory" : "Another day with Pallavi"}
          </h4>

          <div className="space-y-4">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-[#3a2030] focus:border-rose-400 focus:outline-none"
              />
            </Field>
            <Field label="Title (optional)">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A walk by the lake"
                maxLength={120}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-[#3a2030] focus:border-rose-400 focus:outline-none"
              />
            </Field>
            <Field label="Note (optional)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What did this day feel like?"
                maxLength={1000}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm leading-relaxed text-[#3a2030] focus:border-rose-400 focus:outline-none"
              />
            </Field>
            <Field
              label={`Photos (up to ${MAX_PHOTOS_PER_CHAPTER}) · ${photoCount}/${MAX_PHOTOS_PER_CHAPTER}`}
            >
              {(keptPaths.length > 0 || newFiles.length > 0) && (
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {keptPaths.map((path) => (
                    <div
                      key={path}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-rose-200 bg-rose-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl(path)}
                        alt="existing"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setKeptPaths((p) => p.filter((x) => x !== path))
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/95 p-1 text-rose-600 opacity-90 shadow-md transition hover:opacity-100"
                        aria-label="Remove photo"
                        title="Remove"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M18 6L6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {newFiles.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-rose-300 bg-rose-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 rounded bg-white/85 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-rose-700">
                        new
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewFiles((arr) => arr.filter((_, i) => i !== idx))
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/95 p-1 text-rose-600 opacity-90 shadow-md transition hover:opacity-100"
                        aria-label="Remove pending photo"
                        title="Remove"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M18 6L6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {canAddMore ? (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickFiles}
                  className="block w-full text-sm text-[#5a3a4a] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-rose-100 file:px-4 file:py-1.5 file:text-rose-700 hover:file:bg-rose-200"
                />
              ) : (
                <p className="text-xs italic text-[#9a7080]">
                  Limit reached. Remove a photo to add a different one.
                </p>
              )}
            </Field>
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
              className="rounded-full px-5 py-2 text-sm font-medium text-[#7a5560] hover:text-[#3a2030] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white shadow-md transition hover:bg-rose-600 disabled:opacity-60"
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

function ChapterDetailModal({
  m,
  day,
  onClose,
  onViewImages,
}: {
  m: Moment;
  day: number;
  onClose: () => void;
  onViewImages: (paths: string[], initial: number, alt: string) => void;
}) {
  const photos = m.image_paths ?? [];
  const total = photos.length;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const safeIndex = total > 0 ? carouselIndex % total : 0;

  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const longDate = new Date(m.occurred_at).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[55] overflow-y-auto bg-[#3a2030]/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex min-h-full items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        <article
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-[0_30px_80px_-20px_rgba(180,80,110,0.45)]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#3a2030] shadow-md backdrop-blur-sm transition hover:bg-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          {total > 0 && (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-rose-50 sm:aspect-[16/10]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(photos[safeIndex])}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
              />
              <button
                type="button"
                onClick={() =>
                  onViewImages(photos, safeIndex, m.title ?? "A chapter")
                }
                className="relative block h-full w-full cursor-zoom-in"
                aria-label="View photo full screen"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(photos[safeIndex])}
                  alt={m.title ?? "A chapter"}
                  className="h-full w-full object-contain"
                />
              </button>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setCarouselIndex((i) => (i - 1 + total) % total)
                    }
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-2 text-[#3a2030] shadow-md transition hover:bg-white"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setCarouselIndex((i) => (i + 1) % total)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-2 text-[#3a2030] shadow-md transition hover:bg-white"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>

                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Show photo ${i + 1}`}
                        onClick={() => setCarouselIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === safeIndex
                            ? "w-5 bg-white"
                            : "w-1.5 bg-white/60 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-rose-500">
              Day {day} · {longDate}
            </p>
            {m.title && (
              <h2 className="font-serif text-3xl font-medium leading-tight text-[#3a2030] sm:text-4xl">
                {m.title}
              </h2>
            )}
            {m.note && (
              <p className="mt-5 whitespace-pre-wrap font-serif text-base leading-relaxed text-[#3a2030] sm:text-lg sm:leading-relaxed">
                {m.note}
              </p>
            )}
          </div>
        </article>
      </div>
    </div>,
    document.body,
  );
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.error_description === "string") {
      return obj.error_description;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }
  return String(err ?? "Unknown error");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-rose-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Lightbox({
  paths,
  initialIndex,
  alt,
  onClose,
}: {
  paths: string[];
  initialIndex: number;
  alt: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const total = paths.length;
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;

  useEffect(() => {
    lockBodyScroll();
    return unlockBodyScroll;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setIndex((i) => i - 1);
      else if (e.key === "ArrowRight") setIndex((i) => i + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (total === 0) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl(paths[safeIndex])}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-0 h-full w-full cursor-default object-contain"
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i - 1);
            }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i + 1);
            }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
            {paths.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === safeIndex
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
        {total > 1
          ? `${safeIndex + 1} of ${total} · ← → to navigate · Esc to close`
          : "Esc or click outside to close"}
      </p>
    </div>,
    document.body,
  );
}
