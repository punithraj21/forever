"use client";

import Link from "next/link";
import { useState } from "react";

const IMAGE_URL = "/share/engagement/og";
const VENUE_URL = "https://maps.app.goo.gl/bN6oeNQNvGHJVkiX7";
const VENUE_NAME = "Manjunath Grand";
const SHARE_TEXT =
  "Save the date — Punith & Pallavi · Engagement · Sunday, June 21, 2026 · Manjunath Grand";

export default function EngagementSharePage() {
  const [status, setStatus] = useState<string | null>(null);

  async function copyImage() {
    setStatus("Copying…");
    try {
      const res = await fetch(IMAGE_URL);
      const blob = await res.blob();
      // Convert to PNG via canvas if needed; ImageResponse already returns PNG.
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type || "image/png"]: blob }),
      ]);
      setStatus("Copied to clipboard ✓");
    } catch (err) {
      console.error(err);
      setStatus("Copy failed — try Download instead");
    }
    setTimeout(() => setStatus(null), 2400);
  }

  async function shareNative() {
    try {
      const res = await fetch(IMAGE_URL);
      const blob = await res.blob();
      const file = new File([blob], "engagement-save-the-date.png", {
        type: blob.type || "image/png",
      });
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
          title: "Save the date",
          text: SHARE_TEXT,
        });
        return;
      }
      // Fallback: WhatsApp web with text only
      window.open(
        `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`,
        "_blank",
      );
    } catch (err) {
      console.error(err);
      setStatus("Share failed — try Download instead");
      setTimeout(() => setStatus(null), 2400);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-5 py-10 sm:py-14">
      <div className="fade-in mb-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#a06a7c] transition-colors hover:text-rose-600"
        >
          <span aria-hidden>←</span> Back to countdown
        </Link>
      </div>

      <header className="fade-in mb-8 text-center sm:mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          Save the date
        </p>
        <h1 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          Engagement Share Card
        </h1>
        <p className="mx-auto mt-3 max-w-md font-serif text-base italic text-[#7a5560]">
          A 1080×1350 PNG, ready for WhatsApp or Instagram.
        </p>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </header>

      <div className="fade-in w-full max-w-md overflow-hidden rounded-3xl border border-rose-100/80 bg-white/50 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] backdrop-blur-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGE_URL}
          alt="Engagement save-the-date card"
          width={1080}
          height={1350}
          className="h-auto w-full"
        />
      </div>

      <div className="fade-in mt-8 flex w-full max-w-md flex-col gap-3">
        <a
          href={IMAGE_URL}
          download="engagement-save-the-date.png"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3a2030] px-6 py-3.5 text-sm font-medium tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(58,32,48,0.4)] transition-transform hover:-translate-y-0.5"
        >
          <span aria-hidden>↓</span> Download PNG
        </a>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyImage}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white/70 px-4 py-3 text-sm font-medium tracking-wide text-[#5a3a4a] transition-colors hover:bg-rose-50"
          >
            <span aria-hidden>⧉</span> Copy image
          </button>
          <button
            onClick={shareNative}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white/70 px-4 py-3 text-sm font-medium tracking-wide text-[#5a3a4a] transition-colors hover:bg-rose-50"
          >
            <span aria-hidden>↗</span> Share…
          </button>
        </div>

        <a
          href={VENUE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm font-medium tracking-wide text-[#7a4a3a] transition-colors hover:bg-amber-50"
        >
          <span aria-hidden>◉</span> Open {VENUE_NAME} in Maps
        </a>

        {status && (
          <p className="mt-1 text-center text-xs font-medium tracking-wide text-[#a06a7c]">
            {status}
          </p>
        )}
      </div>

      <footer className="fade-in mt-12 text-center text-xs text-[#9a7080]">
        <p className="font-serif italic">
          Save it, send it, see you on the 21st of June.
        </p>
      </footer>
    </main>
  );
}
