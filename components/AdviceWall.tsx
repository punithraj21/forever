"use client";

// "Advice for the Couple" — a guest-submitted advice/blessing wall, backed by
// Supabase (table: public.advice). Anyone may SUBMIT a blessing, but the wall of
// submitted blessings is only DISPLAYED to the unlocked user (localStorage
// "moments_unlocked" === "true", same flag as the Moments UI) — guests just get a
// thank-you after posting. Delete is likewise unlock-gated, so Punith can prune.
//
// Note: DB-level RLS still allows anon select — the unlock check is client-side
// "friction, not security", consistent with the rest of the app. Real read
// privacy would require Supabase Auth.
//
// Requires the `advice` table + RLS policies (migration: supabase/advice.sql).
// Until it exists, insert surfaces the error in the form.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Advice = {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
};

const MAX_MESSAGE = 280;
const MAX_NAME = 60;

// Supabase errors are plain objects, not Error instances — unwrap them so the
// UI never renders "[object Object]". (Mirrors the helper in the Moments form.)
function extractErrorMessage(err: unknown): string {
  if (!err) return "Something went wrong. Please try again.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

export default function AdviceWall() {
  const [items, setItems] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const isUnlocked =
      typeof window !== "undefined" &&
      localStorage.getItem("moments_unlocked") === "true";
    setUnlocked(isUnlocked);
    // Only the unlocked user sees the wall, so only they need the list fetched.
    if (isUnlocked) void fetchAdvice();
    else setLoading(false);
  }, []);

  async function fetchAdvice() {
    setLoading(true);
    const { data, error } = await supabase
      .from("advice")
      .select("*")
      .order("created_at", { ascending: false });
    // Swallow fetch errors (e.g. table not set up yet) into an empty wall so the
    // public page stays clean; submit will still surface real errors.
    if (error) {
      console.warn("advice fetch failed:", extractErrorMessage(error));
      setItems([]);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setSubmitError(null);
    const { data, error } = await supabase
      .from("advice")
      .insert({ name: name.trim() || null, message: trimmed })
      .select()
      .single();
    if (error) {
      setSubmitError(extractErrorMessage(error));
    } else if (data) {
      // Unlocked user sees the wall update live; guests get a thank-you instead.
      if (unlocked) setItems((prev) => [data as Advice, ...prev]);
      setName("");
      setMessage("");
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== id)); // optimistic
    const { error } = await supabase.from("advice").delete().eq("id", id);
    if (error) {
      console.warn("advice delete failed:", extractErrorMessage(error));
      setItems(prev); // roll back
    }
  }

  return (
    <section className="fade-in w-full">
      <div className="mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          Words of wisdom
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          Advice for the Couple
        </h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
        <p className="mx-auto mt-5 max-w-md font-serif text-lg italic text-[#7a5560]">
          Punith shared his. Now leave a little wisdom for the road ahead.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-12 max-w-xl rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/80 to-pink-100/50 p-6 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)] backdrop-blur-sm sm:p-8"
      >
        <label
          htmlFor="advice-message"
          className="block text-xs font-medium uppercase tracking-[0.22em] text-rose-600"
        >
          Your blessing
        </label>
        <textarea
          id="advice-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value.slice(0, MAX_MESSAGE));
            if (submitted) setSubmitted(false);
          }}
          required
          rows={3}
          placeholder="Share a little wisdom for the journey ahead…"
          className="mt-2 w-full resize-none rounded-2xl border border-rose-200 bg-white/70 px-4 py-3 font-serif text-[#3a2030] placeholder:text-[#b79aa6] focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
        <div className="mt-3 flex items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
            placeholder="Your name (optional)"
            className="min-w-0 flex-1 rounded-full border border-rose-200 bg-white/70 px-4 py-2 text-sm text-[#3a2030] placeholder:text-[#b79aa6] focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          <span className="shrink-0 text-xs text-[#9a7080]">
            {message.length}/{MAX_MESSAGE}
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="mt-4 w-full rounded-full bg-rose-500 px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Sharing…" : "Share blessing"}
        </button>
        {submitError && (
          <p className="mt-3 text-center text-sm text-rose-700">{submitError}</p>
        )}
      </form>

      {unlocked ? (
        loading ? (
          <p className="text-center text-sm italic text-[#7a5560]">
            Gathering blessings…
          </p>
        ) : items.length === 0 ? (
          <p className="text-center font-serif text-lg italic text-[#7a5560]">
            No blessings yet — they&rsquo;ll appear here as guests share them.
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((item) => (
              <figure
                key={item.id}
                className="group relative mb-4 break-inside-avoid rounded-2xl border border-rose-100 bg-white/60 p-5 shadow-sm backdrop-blur-sm"
              >
                <blockquote className="font-serif text-base italic leading-relaxed text-[#5a3a4a]">
                  &ldquo;{item.message}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-[#9a7080]">
                  — {item.name?.trim() || "A well-wisher"}
                </figcaption>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete this blessing"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#b79aa6] opacity-0 transition hover:bg-rose-100 hover:text-rose-600 group-hover:opacity-100"
                >
                  ×
                </button>
              </figure>
            ))}
          </div>
        )
      ) : submitted ? (
        <p className="text-center font-serif text-lg italic text-[#5a3a4a]">
          Thank you — your blessing is on its way to Punith &amp; Pallavi. 💕
        </p>
      ) : null}
    </section>
  );
}
