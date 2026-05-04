"use client";

import { useEffect } from "react";
import Countdown from "@/components/Countdown";
import Journey from "@/components/Journey";

export default function WallpaperPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-6 py-6 sm:px-10 sm:py-8">
      <header className="fade-in text-center">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.32em] text-[#a06a7c] sm:text-xs">
          With love
        </p>
        <h1 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl lg:text-6xl">
          Punith <span className="text-rose-400">&</span> Pallavi
        </h1>
        <p className="mx-auto mt-2 font-serif text-sm italic text-[#7a5560] sm:text-base lg:text-lg">
          Counting down to forever
        </p>
        <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </header>

      <div className="mt-6 grid w-full max-w-6xl gap-4 sm:gap-6 lg:grid-cols-2">
        <Countdown
          title="Engagement"
          subtitle="The Promise"
          targetISO="2026-06-21T00:00:00"
          accent="amber"
          emoji="✦"
        />
        <Countdown
          title="Wedding Day"
          subtitle="The Forever"
          targetISO="2026-12-14T00:00:00"
          accent="rose"
          emoji="❀"
        />
      </div>

      <div className="mt-6 w-full max-w-5xl">
        <Journey milestonesOnly compact />
      </div>
    </main>
  );
}
