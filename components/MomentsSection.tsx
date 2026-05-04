"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { supabase, imageUrl, type Moment } from "@/lib/supabase";

const UNLOCK_KEY = "moments_unlocked";

export default function MomentsSection() {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [editing, setEditing] = useState<Moment | "new" | null>(null);

  const refresh = async () => {
    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .order("occurred_at", { ascending: false });
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
    if (m.image_path) {
      await supabase.storage.from("moments").remove([m.image_path]);
    }
    const { error } = await supabase.from("moments").delete().eq("id", m.id);
    if (error) {
      setError(error.message);
      return;
    }
    refresh();
  };

  return (
    <section className="fade-in w-full">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
          Moments
        </h3>
        {unlocked ? (
          <button
            onClick={() => setEditing("new")}
            className="rounded-full border border-rose-300 bg-white/70 px-5 py-2 text-sm font-medium text-rose-700 backdrop-blur-sm transition hover:bg-rose-100/80"
            type="button"
          >
            + Add moment
          </button>
        ) : (
          <a
            href="/unlock"
            className="text-xs uppercase tracking-[0.18em] text-[#9a7080] underline-offset-4 hover:text-rose-700 hover:underline"
          >
            unlock to add
          </a>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
          <p className="font-medium">Couldn&rsquo;t load moments</p>
          <p className="mt-1 font-mono text-xs">{error}</p>
        </div>
      )}

      {moments === null && !error && (
        <div className="text-center text-sm italic text-[#9a7080]">
          Loading moments…
        </div>
      )}

      {moments && moments.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-white/40 p-10 text-center">
          <p className="font-serif text-xl italic text-[#7a5560]">
            No moments yet — every meet is worth remembering.
          </p>
          {unlocked && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rose-500">
              click &ldquo;+ Add moment&rdquo; above
            </p>
          )}
        </div>
      )}

      {moments && moments.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {moments.map((m) => (
            <MomentCard
              key={m.id}
              m={m}
              unlocked={unlocked}
              onEdit={() => setEditing(m)}
              onDelete={() => onDelete(m)}
            />
          ))}
        </div>
      )}

      {editing && (
        <MomentFormModal
          existing={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </section>
  );
}

function MomentCard({
  m,
  unlocked,
  onEdit,
  onDelete,
}: {
  m: Moment;
  unlocked: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const date = new Date(m.occurred_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-rose-200/60 bg-white/70 shadow-[0_10px_30px_-12px_rgba(180,80,110,0.25)] backdrop-blur-sm transition hover:shadow-[0_20px_40px_-15px_rgba(180,80,110,0.35)]">
      {m.image_path && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-rose-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(m.image_path)}
            alt={m.title ?? "A moment"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-rose-500">
          {date}
        </div>
        {m.title && (
          <h4 className="mt-1 font-serif text-xl font-medium leading-tight text-[#3a2030]">
            {m.title}
          </h4>
        )}
        {m.note && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#5a3a4a]">
            {m.note}
          </p>
        )}
      </div>
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
              if (confirm("Delete this moment?")) onDelete();
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

function MomentFormModal({
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
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!existing;
  const currentImagePath = existing?.image_path ?? null;
  const willHaveImage = file !== null || (currentImagePath && !removeImage);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !note.trim() && !willHaveImage) {
      setError("Add a title, a note, or an image — at least one.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      let imagePath: string | null = currentImagePath;

      if (removeImage && currentImagePath) {
        await supabase.storage.from("moments").remove([currentImagePath]);
        imagePath = null;
      }

      if (file) {
        if (currentImagePath && !removeImage) {
          await supabase.storage.from("moments").remove([currentImagePath]);
        }
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from("moments")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (up.error) throw up.error;
        imagePath = path;
      }

      const occurred_at = new Date(`${date}T12:00:00`).toISOString();
      const payload = {
        occurred_at,
        title: title.trim() || null,
        note: note.trim() || null,
        image_path: imagePath,
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
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const closeOnBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  return (
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
        <h4 className="mb-1 font-serif text-2xl font-medium text-[#3a2030]">
          {isEdit ? "Edit moment" : "A moment with Pallavi"}
        </h4>
        <p className="mb-5 text-xs uppercase tracking-[0.18em] text-rose-500">
          {isEdit ? "update the memory" : "remember it forever"}
        </p>

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
              placeholder="Coffee on a rainy day"
              maxLength={120}
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-[#3a2030] focus:border-rose-400 focus:outline-none"
            />
          </Field>
          <Field label="Note (optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What made it special?"
              maxLength={1000}
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm leading-relaxed text-[#3a2030] focus:border-rose-400 focus:outline-none"
            />
          </Field>
          <Field label={isEdit ? "Photo" : "Photo (optional)"}>
            {currentImagePath && !removeImage && !file && (
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(currentImagePath)}
                  alt="current"
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <span className="flex-1 text-xs text-[#7a5560]">
                  Current photo
                </span>
                <button
                  type="button"
                  onClick={() => setRemoveImage(true)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
            {removeImage && currentImagePath && !file && (
              <p className="mb-2 text-xs italic text-[#9a7080]">
                Photo will be removed on save.{" "}
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  className="text-rose-600 hover:underline"
                >
                  Keep it
                </button>
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-[#5a3a4a] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-rose-100 file:px-4 file:py-1.5 file:text-rose-700 hover:file:bg-rose-200"
            />
            {file && (
              <p className="mt-1 truncate text-xs text-[#7a5560]">
                New: {file.name}
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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save moment"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
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
