// /invite2 (English) and /kn/invite2 (Kannada): the invitation built around
// Punith's AI-generated illustration of the couple (public/invite-art.jpg,
// a 1100px-wide JPEG of a Gemini image). The picture fills the first screen
// with an ornate gold plaque over its sky, then fades into the details.
// The original /invite (ivory sheet + garland) is left untouched.
// On wider screens the page is a 480px column over a blurred copy of the art.
// Copy comes from lib/inviteCopy.ts (shared with /invite).

import Link from "next/link";
import DaysToGo from "@/components/DaysToGo";
import ShareButtons from "@/components/ShareButtons";
import { GoldOrnament } from "@/components/WeddingBackdrop";
import { VENUE_MAPS_URL } from "@/lib/calendar";
import type { Lang } from "@/lib/i18n";
import { INVITE_COPY, SHARE_SHORT } from "@/lib/inviteCopy";

const ART = "/invite-art.jpg";
const PLAQUE_TITLE: Record<Lang, string> = {
  en: "Wedding Invitation",
  kn: "ವಿವಾಹ ಆಹ್ವಾನ",
};
const OTHER: Record<Lang, string> = { en: "/kn/invite2", kn: "/invite2" };
const PLAQUE_PATH =
  "M-118 -24 Q-118 -40 -96 -38 L-40 -38 Q-30 -48 0 -48 Q30 -48 40 -38 L96 -38 Q118 -40 118 -24 L118 24 Q118 40 96 38 L40 38 Q30 48 0 48 Q-30 48 -40 38 L-96 38 Q-118 40 -118 24 Z";

/** Ornate gold-framed parchment plaque; the text is HTML laid over it so
 *  Kannada gets the page's Kannada fonts. */
function Plaque({ top, title }: { top: string; title: string }) {
  return (
    <div className="relative mx-auto w-[78%] max-w-[360px]">
      <svg
        aria-hidden
        viewBox="-132 -74 264 130"
        className="block w-full drop-shadow-[0_8px_10px_rgba(90,42,16,0.35)]"
      >
        <defs>
          <linearGradient id="plq-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0b3" />
            <stop offset="0.45" stopColor="#d9a441" />
            <stop offset="1" stopColor="#8a5a14" />
          </linearGradient>
          <linearGradient id="plq-parch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="1" stopColor="#f1dcae" />
          </linearGradient>
        </defs>
        <path
          d={PLAQUE_PATH}
          fill="url(#plq-parch)"
          stroke="url(#plq-gold)"
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <path
          d={PLAQUE_PATH}
          fill="none"
          stroke="#fff3c4"
          strokeWidth={1.3}
          transform="scale(.93)"
        />
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sy]) => (
          <g
            key={`${sx}${sy}`}
            transform={`translate(${sx * 112} ${sy * 28}) scale(${sx} ${sy})`}
          >
            <path
              d="M0 0 C 10 -14 24 -12 22 -2 C 20 6 10 4 12 -2"
              fill="none"
              stroke="url(#plq-gold)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              d="M0 0 C -6 -10 -18 -12 -22 -4"
              fill="none"
              stroke="url(#plq-gold)"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <circle cx={-24} cy={-3} r={2.6} fill="#d9a441" />
          </g>
        ))}
        <path d="M-14 -48 L0 -64 L14 -48 Z" fill="url(#plq-gold)" />
        <circle cx={0} cy={-67} r={4} fill="#c8353f" />
      </svg>
      <div className="absolute inset-x-0 top-[57%] -translate-y-1/2 text-center">
        <p className="font-serif text-[0.95rem] leading-tight text-[#7a4a22] sm:text-base">
          {top}
        </p>
        <p className="mt-1 font-serif text-[1.55rem] font-semibold leading-tight text-[#5a2a1c] sm:text-[1.75rem]">
          {title}
        </p>
      </div>
    </div>
  );
}

export default function InviteArtPage({ lang }: { lang: Lang }) {
  const t = INVITE_COPY[lang];
  return (
    <div
      lang={t.htmlLang}
      className="relative isolate min-h-screen overflow-x-clip bg-[#fdf3e6]"
    >
      {/* wide screens: blurred copy of the art around the column */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden scale-110 bg-cover bg-center opacity-50 blur-2xl sm:block lg:hidden"
        style={{ backgroundImage: `url(${ART})` }}
      />

      <main className="mx-auto min-h-screen max-w-[480px] bg-[#fdf3e6] sm:shadow-[0_0_80px_-10px_rgba(90,42,16,0.45)] lg:grid lg:max-w-none lg:grid-cols-[auto_1fr] lg:shadow-none">
        {/* ── The illustration ─────────────────────────────── */}
        {/* desktop: the art is a full-height panel on the left that stays put
            while the details scroll on the right */}
        <div className="relative lg:sticky lg:top-0 lg:h-screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ART}
            alt={`${t.first} & ${t.second}`}
            width={1100}
            height={1971}
            className="block h-auto w-full lg:h-screen lg:w-auto"
          />
          {/* desktop: soften the seam with the details panel */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-r from-[#fdf3e6]/0 to-[#fdf3e6] lg:block"
          />
          {/* fade into the page (also hides the generator's corner mark) */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-b from-[#fdf3e6]/0 via-[#fdf3e6]/70 to-[#fdf3e6]"
          />
          <div className="absolute inset-x-0 top-[3.5%]">
            <Plaque top={t.opening} title={PLAQUE_TITLE[lang]} />
          </div>
        </div>

        {/* ── Details ──────────────────────────────────────── */}
        <section className="relative -mt-16 px-6 pb-14 text-center lg:mx-auto lg:mt-0 lg:flex lg:min-h-screen lg:w-full lg:max-w-2xl lg:flex-col lg:items-center lg:justify-center lg:px-12 lg:py-16">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-[#9a5a3a]">
            {t.eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-5xl font-medium leading-[1.05] text-[#4a2018]">
            {t.first} <span className="font-normal text-[#c9506a]">&amp;</span>{" "}
            {t.second}
          </h1>
          <GoldOrnament className="mt-5" />
          <p className="mx-auto mt-5 max-w-sm font-serif text-lg italic leading-relaxed text-[#5a3a4a]">
            {t.invitation}
          </p>
          <div className="mt-6">
            <DaysToGo labels={t.daysToGo} year={2027} month={2} day={11} />
          </div>

          {/* stacked with a short gold rule between (side by side, the long
              dates wrap even in the 480px column) */}
          <div className="mt-8 flex flex-col items-center gap-6 lg:grid lg:grid-cols-[1fr_1px_1fr] lg:items-center lg:gap-8">
            {t.events.map((ev, i) => (
              <div key={ev.id} className="contents">
                {i > 0 && (
                  <div
                    aria-hidden
                    className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent lg:h-28 lg:w-px lg:bg-gradient-to-b"
                  />
                )}
                <div>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[#9a3412]">
                    {ev.eyebrow}
                  </p>
                  <p className="mt-1 font-serif text-[2rem] font-medium leading-tight text-[#7a1f2b]">
                    {ev.title}
                  </p>
                  <p className="mt-2 font-serif text-lg text-[#3a2030]">
                    {ev.date}
                  </p>
                  <p className="font-serif text-lg italic text-[#7a5560]">
                    {ev.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <GoldOrnament className="mt-9" />
          <p className="mt-6 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#9a5a3a]">
            {t.venueSection.eyebrow}
          </p>
          <p className="mt-2 font-serif text-3xl font-medium text-[#3a2030]">
            {t.venueName}
          </p>
          <p className="mt-1 font-serif text-lg italic text-[#7a5560]">
            {t.venueTown}
          </p>
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/70 px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7a1f2b] transition hover:bg-amber-50"
          >
            <span aria-hidden>📍</span>
            {t.venueSection.directions}
            <span aria-hidden>→</span>
          </a>

          <GoldOrnament className="mt-10" />
          <h2 className="mt-6 font-serif text-2xl font-light text-[#3a2030]">
            {t.share.heading}
          </h2>
          <p className="mb-5 mt-1 text-sm text-[#7a5560]">{t.share.note}</p>
          <ShareButtons labels={t.share} short={SHARE_SHORT[lang]} />

          <Link
            href={OTHER[lang]}
            lang={lang === "en" ? "kn" : "en"}
            className="mt-8 inline-flex items-center gap-2 text-xs font-medium tracking-[0.06em] text-[#9a5a3a]"
          >
            <span aria-hidden>🌐</span>
            <span className="border-b border-amber-500/70 pb-0.5 transition hover:text-[#7a1f2b]">
              {t.switchTo.label}
            </span>
          </Link>

          <p className="mt-10 font-serif text-base italic text-[#9a7080]">
            {t.footer}
          </p>
        </section>
      </main>
    </div>
  );
}
