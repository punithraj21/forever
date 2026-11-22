// The wedding home page body, shared by `/` (English) and `/kn` (Kannada).
// All copy comes from lib/i18n.ts; layout and design are identical. (`/legacy`
// is a separate frozen snapshot and does not use this.)

import Link from "next/link";
import Countdown from "@/components/Countdown";
import PetalEasterEgg from "@/components/PetalEasterEgg";
import EventDetails from "@/components/EventDetails";
import VenueMap from "@/components/VenueMap";
import WeddingBackdrop, { GoldOrnament } from "@/components/WeddingBackdrop";
import { COPY, type Lang } from "@/lib/i18n";

// Toggle the home-page "Our Story" CTA card. Hidden until Punith asks to surface it.
// The /moments route stays live regardless — flip this to `true` to re-show the card.
const SHOW_OUR_STORY_CTA = false;

export default function WeddingHome({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <div lang={t.htmlLang} className="relative isolate overflow-x-clip">
      <WeddingBackdrop />
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-5 pb-14 pt-56 sm:pb-20 sm:pt-60">
        <header className="fade-in mb-12 text-center sm:mb-16">
          {/* language switch */}
          <Link
            href={t.switchTo.href}
            lang={lang === "en" ? "kn" : "en"}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-white/60 px-4 py-1.5 text-xs font-medium text-[#7a1f2b] shadow-sm backdrop-blur-sm transition hover:bg-amber-50"
          >
            <span aria-hidden>🌐</span>
            {t.switchTo.label}
          </Link>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#9a5a3a]">
            {t.header.eyebrow}
          </p>
          <PetalEasterEgg first={t.header.first} second={t.header.second} />
          <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-[#7a5560] sm:text-xl">
            {t.header.tagline}
          </p>
          <GoldOrnament className="mt-5" />
        </header>

        {/* The wedding is the one hero card — centered, in a double gold-foil frame. */}
        <div className="w-full max-w-2xl rounded-[2rem] bg-gradient-to-br from-amber-300 via-amber-100 to-amber-400 p-[2px] shadow-[0_30px_80px_-20px_rgba(150,80,30,0.45)]">
          <div className="rounded-[calc(2rem-2px)] bg-[#fffaf2] p-[3px] sm:p-2">
            <Countdown
              title={t.countdown.title}
              subtitle={t.countdown.subtitle}
              targetISO="2027-02-11T11:30:00"
              accent="rose"
              emoji="❀"
              passedVerb={t.countdown.passedVerb}
              showMonthsLeft
              lang={lang}
            />
          </div>
        </div>

        <div className="mt-16 w-full sm:mt-24">
          <EventDetails theme="gold" showCalendar only="wedding" lang={lang} />
        </div>

        <div className="mt-16 w-full sm:mt-24">
          <VenueMap theme="gold" only="wedding" lang={lang} />
        </div>

        {SHOW_OUR_STORY_CTA && (
          <div className="mt-16 w-full sm:mt-24">
            <Link
              href="/moments"
              className="fade-in group mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/80 to-pink-100/60 p-10 text-center shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] backdrop-blur-sm transition hover:shadow-[0_30px_70px_-15px_rgba(180,80,110,0.35)]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
                chapter by chapter
              </p>
              <h3 className="font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
                Our Story
              </h3>
              <p className="font-serif text-base italic text-[#7a5560]">
                Read every chapter, from the day we met.
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.22em] text-rose-600 transition-all group-hover:gap-3">
                Open our story <span aria-hidden>→</span>
              </span>
            </Link>
          </div>
        )}

        <section className="fade-in mt-16 max-w-2xl text-center sm:mt-24">
          <GoldOrnament className="mb-8" />
          <p className="font-serif text-xl italic leading-relaxed text-[#5a3a4a] sm:text-2xl">
            &ldquo;{t.quote.text}&rdquo;
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#9a7080]">
            — {t.quote.by}
          </p>
        </section>

        <footer className="fade-in mt-16 text-center text-sm text-[#9a7080] sm:mt-20">
          <p className="font-serif italic">{t.footer}</p>
        </footer>
      </main>
    </div>
  );
}
