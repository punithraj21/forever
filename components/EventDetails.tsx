// Event Details section for the home page.
//
// Dates are fixed (and match the countdown cards). The venue links out to
// Google Maps via each event's `mapUrl`.
//
// `image` is the banner photo at the top of the card. The current values point
// to on-brand placeholders in /public/venues — swap them for real photos by
// dropping a file in /public/venues and updating the path, or by pasting a
// direct image URL (any https://… image link works, no extra config needed).

type EventInfo = {
  eyebrow: string;
  emoji: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  mapUrl: string;
  image?: string;
  accent: "amber" | "rose";
};

const EVENTS: EventInfo[] = [
  {
    eyebrow: "The Promise",
    emoji: "✦",
    title: "Engagement",
    date: "Sunday, June 21, 2026",
    time: "10:00 AM onwards",
    venue: "Shri Manjunatha Grand Veg",
    mapUrl: "https://maps.app.goo.gl/TjT39YazGP5VF4AaA",
    image: "/venues/engagement.svg",
    accent: "amber",
  },
  {
    eyebrow: "The Forever",
    emoji: "❀",
    title: "Wedding Day",
    date: "Thursday, February 11, 2027",
    time: "11:30 AM",
    venue: "NS Convention Halls",
    mapUrl: "https://maps.app.goo.gl/DEe8rXU4ch4fGqxf7",
    image: "/venues/wedding.svg",
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

export default function EventDetails() {
  return (
    <section className="fade-in w-full">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          Where &amp; when
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          Event Details
        </h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </div>

      <div
        className={`grid w-full gap-6 sm:gap-8 ${
          EVENTS.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-xl"
        }`}
      >
        {EVENTS.map((event) => {
          const accent = ACCENT[event.accent];
          return (
            <div
              key={event.title}
              className={`flex flex-col overflow-hidden rounded-3xl border bg-gradient-to-br shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)] backdrop-blur-sm ${accent.card}`}
            >
              {event.image && (
                <div className="relative h-44 w-full overflow-hidden sm:h-52">
                  {/* Plain <img> (not next/image) so external photo URLs work without remote-image config */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image}
                    alt={event.venue}
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
                  {event.eyebrow}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-light tracking-tight text-[#3a2030]">
                  {event.title}
                </h3>

                <dl className="mt-6 flex flex-col gap-3">
                <DetailRow
                  label="Date"
                  value={event.date}
                  labelClass={accent.label}
                />
                <DetailRow
                  label="Time"
                  value={event.time}
                  labelClass={accent.label}
                />
                <DetailRow
                  label="Venue"
                  value={
                    <span className="flex flex-col gap-0.5">
                      <span>{event.venue}</span>
                      {event.mapUrl && (
                        <a
                          href={event.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mt-1 inline-flex w-fit items-center gap-1 text-xs font-medium uppercase tracking-[0.18em] transition ${accent.link}`}
                        >
                          View map <span aria-hidden>→</span>
                        </a>
                      )}
                    </span>
                  }
                  labelClass={accent.label}
                />
                </dl>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
