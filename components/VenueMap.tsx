// Interactive venue maps on the home page — one embedded Google Map per venue.
//
// Uses the keyless `maps.google.com/maps?q=lat,lon&output=embed` iframe (no API
// key, no billing, fully pan/zoom interactive). Note: this can get blocked in
// sandboxed/headless browsers (X-Frame-Options → net::ERR_ABORTED in the dev
// preview), but it loads fine in normal browsers — which is where the site is
// actually used. The "Get directions →" link uses each venue's Google Maps short
// link so navigation opens the exact pin in the Maps app.
//
// Pass `only="wedding"` to render just that venue (the home page does). With no
// prop every venue renders — /legacy relies on that, so keep it the default.

function googleEmbed(lat: number, lon: number): string {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=15&hl=en&output=embed`;
}

import { COPY, type Lang } from "@/lib/i18n";

type Venue = {
  id: "engagement" | "wedding";
  eyebrow: string;
  emoji: string;
  venue: string;
  lat: number;
  lon: number;
  mapUrl: string;
  accent: "amber" | "rose";
};

const VENUES: Venue[] = [
  {
    id: "engagement",
    eyebrow: "Engagement · The Promise",
    emoji: "✦",
    venue: "Shri Manjunatha Grand Veg",
    lat: 13.2802724,
    lon: 77.5545281,
    mapUrl: "https://maps.app.goo.gl/TjT39YazGP5VF4AaA",
    accent: "amber",
  },
  {
    id: "wedding",
    eyebrow: "Wedding · The Forever",
    emoji: "❀",
    venue: "NS Convention Hall",
    lat: 13.2872715,
    lon: 77.5738031,
    mapUrl: "https://maps.app.goo.gl/DEe8rXU4ch4fGqxf7",
    accent: "rose",
  },
];

const ACCENT = {
  amber: {
    card: "border-amber-200/70 from-amber-50/80 to-orange-100/40",
    eyebrow: "text-amber-700",
    link: "text-amber-700 hover:text-amber-800",
  },
  rose: {
    card: "border-rose-200/70 from-rose-50/80 to-pink-100/50",
    eyebrow: "text-rose-600",
    link: "text-rose-600 hover:text-rose-700",
  },
  // ivory + gold-foil look that matches the home page's wedding backdrop
  gold: {
    card: "border-amber-300/70 from-[#fffaf1] to-[#fbeedd]",
    eyebrow: "text-[#9a3412]",
    link: "text-[#7a1f2b] hover:text-[#4a0f1c]",
  },
} as const;

export default function VenueMap({
  only,
  label,
  theme,
  lang,
}: {
  /** Wedding-card copy from lib/i18n (use with only="wedding"); omit for the original data. */
  lang?: Lang;
  /** "gold" switches to the ivory/gold home-page look; default keeps /legacy's pink. */
  theme?: "gold";
  only?: Venue["id"];
  /** Overrides the card's eyebrow (default keeps /legacy unchanged). */
  label?: string;
}) {
  const venues = only ? VENUES.filter((v) => v.id === only) : VENUES;
  const t = lang ? COPY[lang].map : null;
  return (
    <section className="fade-in w-full">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          {t?.eyebrow ?? "Find your way"}
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          {t?.heading ?? "On the Map"}
        </h2>
        <div
          className={`mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent to-transparent ${
            theme === "gold" ? "via-amber-500/80" : "via-rose-300"
          }`}
        />
      </div>

      <div
        className={`grid w-full gap-6 sm:gap-8 ${
          venues.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-xl"
        }`}
      >
        {venues.map((v) => {
          const gold = theme === "gold";
          const accent = ACCENT[gold ? "gold" : v.accent];
          return (
            <div
              key={v.venue}
              className={`flex flex-col rounded-3xl border bg-gradient-to-br p-5 backdrop-blur-sm ${
                gold
                  ? "shadow-[0_24px_70px_-20px_rgba(150,80,30,0.4)]"
                  : "shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)]"
              } ${accent.card}`}
            >
              <p
                className={`px-2 pt-1 text-xs font-medium uppercase tracking-[0.32em] ${accent.eyebrow}`}
              >
                <span aria-hidden className="mr-1.5">
                  {v.emoji}
                </span>
                {t?.cardEyebrow ?? label ?? v.eyebrow}
              </p>
              <h3 className="px-2 pb-1 font-serif text-2xl font-light tracking-tight text-[#3a2030]">
                {t?.venue ?? v.venue}
              </h3>

              <div
                className={`mt-4 overflow-hidden rounded-2xl border ${
                  gold ? "border-amber-300/70" : "border-[#3a2030]/10"
                }`}
              >
                <iframe
                  title={`Map to ${v.venue}`}
                  src={googleEmbed(v.lat, v.lon)}
                  className="block h-64 w-full border-0 sm:h-72"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={v.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-flex w-fit items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-[0.18em] transition ${accent.link}`}
              >
                {t?.directions ?? "Get directions"} <span aria-hidden>→</span>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
