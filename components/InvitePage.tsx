// Share-ready wedding invitation (no countdown): Reception + Muhurtha set as
// centred invitation text (deliberately no cards and no calendar buttons —
// Punith asked for a plain printed-invitation feel), the venue, and share
// buttons. Same backdrop and gold/ivory
// language as the home page. Served at /invite (English), /kn/invite (Kannada)
// and /en/invite; on wedding.devshark.site /invite opens in Kannada (proxy.ts).
// All copy lives in lib/inviteCopy.ts, event times in lib/calendar.ts.

import { Fragment } from "react";
import Link from "next/link";
import PetalEasterEgg from "@/components/PetalEasterEgg";
import ShareButtons from "@/components/ShareButtons";
import WeddingBackdrop, { GoldOrnament } from "@/components/WeddingBackdrop";
import { VENUE_MAPS_URL } from "@/lib/calendar";
import type { Lang } from "@/lib/i18n";
import { INVITE_COPY } from "@/lib/inviteCopy";

export default function InvitePage({ lang }: { lang: Lang }) {
  const t = INVITE_COPY[lang];
  return (
    <div lang={t.htmlLang} className="relative isolate overflow-x-clip">
      <WeddingBackdrop />
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-5 pb-14 pt-56 sm:pb-20 sm:pt-60">
        {/* ── Invitation header ─────────────────────────────── */}
        <header className="fade-in mb-12 max-w-2xl text-center sm:mb-16">
          <Link
            href={t.switchTo.href}
            lang={lang === "en" ? "kn" : "en"}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-white/60 px-4 py-1.5 text-xs font-medium text-[#7a1f2b] shadow-sm backdrop-blur-sm transition hover:bg-amber-50"
          >
            <span aria-hidden>🌐</span>
            {t.switchTo.label}
          </Link>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#9a5a3a]">
            {t.eyebrow}
          </p>
          <PetalEasterEgg first={t.first} second={t.second} />
          <GoldOrnament className="mt-6" />
          <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-[#5a3a4a] sm:text-2xl">
            {t.invitation}
          </p>
        </header>

        {/* ── The two celebrations, as invitation text ─────── */}
        <div className="grid w-full max-w-4xl items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          {t.events.map((ev, i) => (
            <Fragment key={ev.id}>
              {i > 0 && (
                <>
                  {/* stacked (phones): gold ornament · side by side: gold rule */}
                  <GoldOrnament className="lg:hidden" />
                  <div
                    aria-hidden
                    className="hidden h-40 w-px bg-gradient-to-b from-transparent via-amber-500/70 to-transparent lg:block"
                  />
                </>
              )}
              <section className="fade-in text-center">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#9a3412]">
                  <span aria-hidden className="mr-1.5">
                    {ev.emoji}
                  </span>
                  {ev.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-5xl font-medium tracking-tight text-[#3a2030] sm:text-6xl">
                  {ev.title}
                </h2>
                <p className="mt-5 font-serif text-xl text-[#3a2030] sm:text-2xl">
                  {ev.date}
                </p>
                <p className="mt-1 font-serif text-lg italic text-[#7a5560] sm:text-xl">
                  {ev.time}
                </p>
              </section>
            </Fragment>
          ))}
        </div>

        {/* ── Venue ─────────────────────────────────────────── */}
        <section className="fade-in mt-16 w-full max-w-xl sm:mt-24">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#9a5a3a]">
              {t.venueSection.eyebrow}
            </p>
            <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
              {t.venueSection.heading}
            </h2>
          </div>
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-3xl border border-amber-300/70 shadow-[0_24px_70px_-20px_rgba(150,80,30,0.4)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.venueSection.banner}
              alt={`${t.venueName}, ${t.venueTown}`}
              className="h-44 w-full object-cover transition group-hover:scale-[1.02] sm:h-52"
            />
            <div className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#fffaf1] to-[#fbeedd] px-6 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#7a1f2b]">
              <span aria-hidden>📍</span>
              {t.venueSection.directions}
              <span aria-hidden>→</span>
            </div>
          </a>
        </section>

        {/* ── Share ─────────────────────────────────────────── */}
        <section className="fade-in mt-16 w-full max-w-2xl text-center sm:mt-24">
          <GoldOrnament className="mb-8" />
          <h2 className="font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
            {t.share.heading}
          </h2>
          <p className="mb-7 mt-2 text-sm text-[#7a5560]">{t.share.note}</p>
          <ShareButtons labels={t.share} />
        </section>

        <footer className="fade-in mt-16 text-center text-sm text-[#9a7080] sm:mt-20">
          <p className="font-serif text-base italic">{t.footer}</p>
        </footer>
      </main>
    </div>
  );
}
