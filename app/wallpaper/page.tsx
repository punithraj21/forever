"use client";

import Link from "next/link";
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
    <main className="fixed inset-0 flex flex-col items-center justify-evenly overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
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

      <div className="grid w-full max-w-6xl gap-8 sm:gap-12 lg:gap-16 lg:grid-cols-2">
        <Countdown
          title="Engagement"
          subtitle="The Promise"
          targetISO="2026-06-21T10:00:00"
          accent="amber"
          emoji="✦"
          passedVerb="Engaged"
        />
        <Countdown
          title="Wedding Day"
          subtitle="The Forever"
          targetISO="2027-02-11T11:30:00"
          accent="rose"
          emoji="❀"
          passedVerb="Married"
        />
      </div>

      <div className="w-full max-w-5xl">
        <Journey milestonesOnly compact />
      </div>

      <Link
        href="/wallpaper-two"
        title="Switch to flip-card theme"
        className="fixed bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-[#3a2030]/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/95 backdrop-blur-md transition hover:bg-[#3a2030] sm:text-xs"
      >
        <span aria-hidden>↺</span> Flip theme
      </Link>
    </main>
  );
}
