// Share-ready wedding invitation (no countdown). Everything sits on one ivory
// "printed invitation" sheet — double gold border, gold corner ornaments —
// so the text never runs over the backdrop's mandala (the first version set
// plain text straight on the backdrop and Punith found it hard to read).
// Inside the sheet the Reception + Muhurtha are plain centred text (no
// per-event cards and no calendar buttons — Punith removed both), then the
// venue with a directions link. Share buttons sit below the sheet.
// Served at /invite (English), /kn/invite (Kannada) and /en/invite; it is the
// front page of pallavipunith.site, and wedding.devshark.site/invite opens in
// Kannada (proxy.ts). Copy lives in lib/inviteCopy.ts, times in lib/calendar.ts.

import { Fragment } from "react";
import Link from "next/link";
import PetalEasterEgg from "@/components/PetalEasterEgg";
import DaysToGo from "@/components/DaysToGo";
import ShareButtons from "@/components/ShareButtons";
import WeddingBackdrop, { GoldOrnament } from "@/components/WeddingBackdrop";
import { VENUE_MAPS_URL } from "@/lib/calendar";
import type { Lang } from "@/lib/i18n";
import { INVITE_COPY } from "@/lib/inviteCopy";

/** Small gold corner flourish; rotated for each corner of the sheet. */
function Corner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className={`absolute h-10 w-10 text-amber-600/80 sm:h-12 sm:w-12 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
    >
      <path d="M4 30V4h26" />
      <path d="M9 22V9h13" />
      <path d="M9 9c6 0 10 4 10 10" opacity={0.7} />
      <circle cx="4" cy="4" r="2.2" fill="currentColor" stroke="none" />
      <path d="M30 4l3-2.2L36 4l-3 2.2z" fill="currentColor" stroke="none" />
      <path d="M4 30l-2.2 3L4 36l2.2-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function InvitePage({ lang }: { lang: Lang }) {
  const t = INVITE_COPY[lang];
  return (
    <div lang={t.htmlLang} className="relative isolate overflow-x-clip">
      <WeddingBackdrop quiet garlandFront />
      <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center px-4 pb-14 pt-[150px] sm:px-6 sm:pb-20 sm:pt-[170px]">
        {/* ── The invitation sheet ──────────────────────────── */}
        <article className="fade-in relative w-full rounded-[28px] border border-amber-500/60 bg-[#fffaf2] p-2 shadow-[0_30px_80px_-25px_rgba(140,70,30,0.45)] sm:p-3">
          <div className="relative rounded-[20px] border border-amber-500/40 px-6 py-12 text-center sm:px-14 sm:py-16">
            <Corner className="left-2 top-2" />
            <Corner className="right-2 top-2 rotate-90" />
            <Corner className="bottom-2 right-2 rotate-180" />
            <Corner className="bottom-2 left-2 -rotate-90" />

            <p className="mb-5 font-serif text-lg text-[#9a5a3a] sm:text-xl">
              {t.opening}
            </p>
            <div className="mx-auto mb-6 h-36 w-36 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-200 p-[3px] shadow-[0_10px_30px_-8px_rgba(140,70,30,0.5)] sm:h-44 sm:w-44">
              <div className="h-full w-full rounded-full bg-[#fffaf2] p-[3px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/couple.jpg"
                  alt="Punith and Pallavi"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-[#9a5a3a] sm:text-xs">
              {t.eyebrow}
            </p>
            <div className="mt-3">
              <PetalEasterEgg first={t.first} second={t.second} />
            </div>
            <GoldOrnament className="mt-5" />
            <p className="mx-auto mt-6 max-w-lg font-serif text-lg italic leading-relaxed text-[#5a3a4a] sm:text-xl">
              {t.invitation}
            </p>

            <div className="mt-8">
              <DaysToGo labels={t.daysToGo} year={2027} month={2} day={11} />
            </div>

            {/* the two celebrations */}
            <div className="mx-auto mt-10 grid max-w-2xl items-center gap-8 sm:mt-12 md:grid-cols-[1fr_auto_1fr] md:gap-10">
              {t.events.map((ev, i) => (
                <Fragment key={ev.id}>
                  {i > 0 && (
                    <>
                      <GoldOrnament className="md:hidden" />
                      <div
                        aria-hidden
                        className="hidden h-32 w-px bg-gradient-to-b from-transparent via-amber-500/70 to-transparent md:block"
                      />
                    </>
                  )}
                  <section>
                    <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#9a3412] sm:text-xs">
                      {ev.eyebrow}
                    </p>
                    <h2 className="mt-2 font-serif text-4xl font-medium text-[#7a1f2b] sm:text-5xl">
                      {ev.title}
                    </h2>
                    <p className="mt-4 font-serif text-lg text-[#3a2030] sm:text-xl">
                      {ev.date}
                    </p>
                    <p className="mt-0.5 font-serif text-base italic text-[#7a5560] sm:text-lg">
                      {ev.time}
                    </p>
                  </section>
                </Fragment>
              ))}
            </div>

            {/* venue */}
            <GoldOrnament className="mt-12 sm:mt-14" />
            <p className="mt-6 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#9a5a3a] sm:text-xs">
              {t.venueSection.eyebrow}
            </p>
            <p className="mt-2 font-serif text-3xl font-medium text-[#3a2030] sm:text-4xl">
              {t.venueName}
            </p>
            <p className="mt-1 font-serif text-lg italic text-[#7a5560] sm:text-xl">
              {t.venueTown}
            </p>
            <a
              href={VENUE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/70 px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7a1f2b] transition hover:bg-amber-50"
            >
              <span aria-hidden>📍</span>
              {t.venueSection.directions}
              <span aria-hidden>→</span>
            </a>

            <p className="mt-12 font-serif text-base italic text-[#9a7080] sm:mt-14">
              {t.footer}
            </p>
          </div>
        </article>

        <Link
          href={t.switchTo.href}
          lang={lang === "en" ? "kn" : "en"}
          className="fade-in mt-10 inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-[#7a1f2b] shadow-sm backdrop-blur-sm transition hover:bg-amber-50"
        >
          <span aria-hidden>🌐</span>
          {t.switchTo.label}
        </Link>

        {/* ── Share ─────────────────────────────────────────── */}
        <section className="fade-in mt-12 w-full max-w-2xl text-center sm:mt-16">
          <h2 className="font-serif text-2xl font-light tracking-tight text-[#3a2030] sm:text-3xl">
            {t.share.heading}
          </h2>
          <p className="mb-6 mt-1.5 text-sm text-[#7a5560]">{t.share.note}</p>
          <ShareButtons labels={t.share} />
        </section>
      </main>
    </div>
  );
}
