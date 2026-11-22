// Event Details section for the home page.
//
// Dates are fixed (and match the countdown cards). The venue links out to
// Google Maps via each event's `mapUrl`.
//
// Pass `only="wedding"` to render just that event (the home page does). With no
// prop every event renders — /legacy relies on that, so keep it the default.
//
// `image` is the banner photo at the top of the card. The current values point
// to on-brand placeholders in /public/venues — swap them for real photos by
// dropping a file in /public/venues and updating the path, or by pasting a
// direct image URL (any https://… image link works, no extra config needed).

import { COPY, type Lang } from "@/lib/i18n";
import { WEDDING, googleCalUrl, ENGAGEMENT_MAPS_URL, VENUE_MAPS_URL } from "@/lib/calendar";

type EventInfo = {
  id: "engagement" | "wedding";
  eyebrow: string;
  emoji: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  mapUrl: string;
  image?: string;
  /** Banner used when the section is rendered with theme="gold". */
  goldImage?: string;
  /** Calendar links, shown when the section is rendered with `showCalendar`. */
  calendar?: { google: string; ics: string };
  accent: "amber" | "rose";
};

// Google Calendar link built from the shared event data in lib/calendar.ts.
const WEDDING_GOOGLE_CAL = googleCalUrl(WEDDING);

const EVENTS: EventInfo[] = [
  {
    id: "engagement",
    eyebrow: "The Promise",
    emoji: "✦",
    title: "Engagement",
    date: "Sunday, June 21, 2026",
    time: "10:00 AM onwards",
    venue: "Shri Manjunatha Grand Veg",
    mapUrl: ENGAGEMENT_MAPS_URL,
    image: "/venues/engagement.svg",
    accent: "amber",
  },
  {
    id: "wedding",
    eyebrow: "The Forever",
    emoji: "❀",
    title: "Wedding Day",
    date: "Thursday, February 11, 2027",
    time: "11:30 AM",
    venue: "NS Convention Hall",
    mapUrl: VENUE_MAPS_URL,
    image: "/venues/wedding.svg",
    goldImage: "/venues/wedding-gold.svg",
    calendar: { google: WEDDING_GOOGLE_CAL, ics: "/wedding.ics" },
    accent: "rose",
  },
];

const ACCENT = {
  amber: {
    card: "border-amber-200/70 from-amber-50/80 to-orange-100/40",
    eyebrow: "text-amber-700",
    label: "text-amber-700/80",
    link: "text-amber-700 hover:text-amber-800",
  },
  rose: {
    card: "border-rose-200/70 from-rose-50/80 to-pink-100/50",
    eyebrow: "text-rose-600",
    label: "text-rose-600/80",
    link: "text-rose-600 hover:text-rose-700",
  },
  // ivory + gold-foil look that matches the home page's wedding backdrop
  gold: {
    card: "border-amber-300/70 from-[#fffaf1] to-[#fbeedd]",
    eyebrow: "text-[#9a3412]",
    label: "text-amber-700",
    link: "text-[#7a1f2b] hover:text-[#4a0f1c]",
  },
} as const;

function DetailRow({
  label,
  value,
  labelClass,
}: {
  label: string;
  value: React.ReactNode;
  labelClass: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-[#3a2030]/10 pt-3 first:border-t-0 first:pt-0">
      <dt
        className={`text-[0.65rem] font-medium uppercase tracking-[0.22em] ${labelClass}`}
      >
        {label}
      </dt>
      <dd className="font-serif text-lg text-[#3a2030]">{value}</dd>
    </div>
  );
}

export default function EventDetails({
  only,
  eyebrow = "Where & when",
  label,
  theme,
  showCalendar,
  lang,
}: {
  /** Show "Add to calendar" buttons (Google + .ics) on events that have them. */
  showCalendar?: boolean;
  /** Wedding-card copy from lib/i18n (use with only="wedding"); omit for the original data. */
  lang?: Lang;
  /** "gold" switches to the ivory/gold home-page look; default keeps /legacy's pink. */
  theme?: "gold";
  only?: EventInfo["id"];
  /** Overrides the card's displayed title (default keeps /legacy unchanged). */
  label?: string;
  /** Small label above the heading. Default keeps /legacy unchanged. */
  eyebrow?: string;
}) {
  const events = only ? EVENTS.filter((e) => e.id === only) : EVENTS;
  const t = lang ? COPY[lang].details : null;
  return (
    <section className="fade-in w-full">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          {t?.eyebrow ?? eyebrow}
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          {t?.heading ?? "Event Details"}
        </h2>
        <div
          className={`mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent to-transparent ${
            theme === "gold" ? "via-amber-500/80" : "via-rose-300"
          }`}
        />
      </div>

      <div
        className={`grid w-full gap-6 sm:gap-8 ${
          events.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-xl"
        }`}
      >
        {events.map((event) => {
          const gold = theme === "gold";
          const accent = ACCENT[gold ? "gold" : event.accent];
          const image = t?.banner ?? ((gold && event.goldImage) || event.image);
          const venue = t?.venue ?? event.venue;
          return (
            <div
              key={event.title}
              className={`flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-br backdrop-blur-sm ${
                gold
                  ? "shadow-[0_24px_70px_-20px_rgba(150,80,30,0.4)]"
                  : "shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)]"
              } ${accent.card}`}
            >
              {image && (
                <div className="relative h-44 w-full overflow-hidden sm:h-52">
                  {/* Plain <img> (not next/image) so external photo URLs work without remote-image config */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={venue}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3a2030]/20 to-transparent" />
                </div>
              )}
              <div className="flex flex-col p-8">
                <p
                  className={`text-xs font-medium uppercase tracking-[0.32em] ${accent.eyebrow}`}
                >
                  <span aria-hidden className="mr-1.5">
                    {event.emoji}
                  </span>
                  {t?.cardEyebrow ?? event.eyebrow}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-light tracking-tight text-[#3a2030]">
                  {t?.cardTitle ?? label ?? event.title}
                </h3>

                <dl className="mt-6 flex flex-col gap-3">
                  <DetailRow
                    label={t?.labels.date ?? "Date"}
                    value={t?.date ?? event.date}
                    labelClass={accent.label}
                  />
                  <DetailRow
                    label={t?.labels.time ?? "Time"}
                    value={t?.time ?? event.time}
                    labelClass={accent.label}
                  />
                  <DetailRow
                    label={t?.labels.venue ?? "Venue"}
                    value={
                      <span className="flex flex-col gap-0.5">
                        <span>{venue}</span>
                        {event.mapUrl && (
                          <a
                            href={event.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-1 inline-flex w-fit items-center gap-1 text-xs font-medium uppercase tracking-[0.18em] transition ${accent.link}`}
                          >
                            {t?.viewMap ?? "View map"}{" "}
                            <span aria-hidden>→</span>
                          </a>
                        )}
                      </span>
                    }
                    labelClass={accent.label}
                  />
                </dl>

                {showCalendar && event.calendar && (
                  <div className="mt-7 flex flex-wrap gap-3 border-t border-[#3a2030]/10 pt-6">
                    <a
                      href={event.calendar.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#7a1f2b] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-[#fdf2dc] shadow-sm transition hover:bg-[#5e1520]"
                    >
                      <span aria-hidden>📅</span>{" "}
                      {t?.googleCal ?? "Google Calendar"}
                    </a>
                    <a
                      href={event.calendar.ics}
                      download
                      className="inline-flex items-center gap-2 rounded-full border border-amber-400/80 bg-white/60 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-[#7a1f2b] transition hover:bg-amber-50"
                    >
                      {t?.otherCal ?? "Apple / Outlook"}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
