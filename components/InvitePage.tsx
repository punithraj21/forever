// Share-ready wedding invitation (no countdown): Reception + Muhurtha cards,
// the venue, add-to-calendar and share buttons. Same backdrop and gold/ivory
// language as the home page. Served at /invite (English), /kn/invite (Kannada)
// and /en/invite; on wedding.devshark.site /invite opens in Kannada (proxy.ts).
// All copy lives in lib/inviteCopy.ts, event times in lib/calendar.ts.

import Link from "next/link";
import PetalEasterEgg from "@/components/PetalEasterEgg";
import ShareButtons from "@/components/ShareButtons";
import WeddingBackdrop, { GoldOrnament } from "@/components/WeddingBackdrop";
import {
  RECEPTION,
  VENUE_MAPS_URL,
  WEDDING,
  googleCalUrl,
} from "@/lib/calendar";
import type { Lang } from "@/lib/i18n";
import { INVITE_COPY } from "@/lib/inviteCopy";

const CAL = {
  reception: { google: googleCalUrl(RECEPTION), ics: "/reception.ics" },
  wedding: { google: googleCalUrl(WEDDING), ics: "/wedding.ics" },
} as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-[#3a2030]/10 pt-3 first:border-t-0 first:pt-0">
      <dt className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-amber-700">
        {label}
      </dt>
      <dd className="font-serif text-lg text-[#3a2030]">{value}</dd>
    </div>
  );
}

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

        {/* ── Event cards: Reception, then Muhurtha ─────────── */}
        <div className="grid w-full max-w-4xl gap-6 sm:gap-8 lg:grid-cols-2">
          {t.events.map((ev) => (
            <div
              key={ev.id}
              className="fade-in rounded-[2rem] bg-gradient-to-br from-amber-300 via-amber-100 to-amber-400 p-[2px] shadow-[0_30px_80px_-20px_rgba(150,80,30,0.45)]"
            >
              <div className="flex h-full flex-col rounded-[calc(2rem-2px)] bg-gradient-to-br from-[#fffaf1] to-[#fbeedd] p-8 sm:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#9a3412]">
                  <span aria-hidden className="mr-1.5">
                    {ev.emoji}
                  </span>
                  {ev.eyebrow}
                </p>
                <h2 className="mt-2 font-serif text-4xl font-medium tracking-tight text-[#3a2030]">
                  {ev.title}
                </h2>
                <dl className="mt-6 flex flex-col gap-3">
                  <Row label={t.labels.date} value={ev.date} />
                  <Row label={t.labels.time} value={ev.time} />
                  <Row
                    label={t.labels.venue}
                    value={`${t.venueName}, ${t.venueTown}`}
                  />
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-7">
                  <a
                    href={CAL[ev.id].google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#7a1f2b] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#fdf2dc] shadow-sm transition hover:bg-[#5e1520]"
                  >
                    <span aria-hidden>📅</span>
                    {t.calendar.google}
                  </a>
                  <a
                    href={CAL[ev.id].ics}
                    download
                    className="inline-flex items-center rounded-full border border-amber-400/80 bg-white/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7a1f2b] transition hover:bg-amber-50"
                  >
                    {t.calendar.other}
                  </a>
                </div>
              </div>
            </div>
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
