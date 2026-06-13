// Interactive venue maps on the home page — one embedded Google Map per venue.
//
// Uses the keyless `maps.google.com/maps?q=lat,lon&output=embed` iframe (no API
// key, no billing, fully pan/zoom interactive). Note: this can get blocked in
// sandboxed/headless browsers (X-Frame-Options → net::ERR_ABORTED in the dev
// preview), but it loads fine in normal browsers — which is where the site is
// actually used. The "Get directions →" link uses each venue's Google Maps short
// link so navigation opens the exact pin in the Maps app.

function googleEmbed(lat: number, lon: number): string {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=15&hl=en&output=embed`;
}

type Venue = {
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
    eyebrow: "Engagement · The Promise",
    emoji: "✦",
    venue: "Shri Manjunatha Grand Veg",
    lat: 13.2802724,
    lon: 77.5545281,
    mapUrl: "https://maps.app.goo.gl/TjT39YazGP5VF4AaA",
    accent: "amber",
  },
  {
    eyebrow: "Wedding · The Forever",
    emoji: "❀",
    venue: "NS Convention Halls",
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
} as const;

export default function VenueMap() {
  return (
    <section className="fade-in w-full">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          Find your way
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          On the Map
        </h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </div>

      <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-2">
        {VENUES.map((v) => {
          const accent = ACCENT[v.accent];
          return (
            <div
              key={v.venue}
              className={`flex flex-col rounded-3xl border bg-gradient-to-br p-5 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)] backdrop-blur-sm ${accent.card}`}
            >
              <p
                className={`px-2 pt-1 text-xs font-medium uppercase tracking-[0.32em] ${accent.eyebrow}`}
              >
                <span aria-hidden className="mr-1.5">
                  {v.emoji}
                </span>
                {v.eyebrow}
              </p>
              <h3 className="px-2 pb-1 font-serif text-2xl font-light tracking-tight text-[#3a2030]">
                {v.venue}
              </h3>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#3a2030]/10">
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
                Get directions <span aria-hidden>→</span>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
