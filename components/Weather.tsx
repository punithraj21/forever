"use client";

// Weather forecast per event, powered by Open-Meteo (free, no API key, CORS-enabled).
//
// Forecast data is only available ~16 days out, so dates beyond that window show
// a seasonal note instead. The window check is dynamic against the real "today",
// so the wedding card will auto-switch to a live forecast once Feb 2027 is near.

import { useEffect, useState } from "react";

type Accent = "amber" | "rose";

type EventWeather = {
  title: string;
  dateISO: string; // yyyy-mm-dd, used for the forecast query
  dateLabel: string;
  lat: number;
  lon: number;
  accent: Accent;
  seasonalNote: string;
};

const EVENTS: EventWeather[] = [
  {
    title: "Engagement",
    dateISO: "2026-06-21",
    dateLabel: "June 21, 2026",
    lat: 13.2803,
    lon: 77.5545,
    accent: "amber",
    seasonalNote:
      "Late June in Bengaluru is warm and humid with passing monsoon showers — usually around 28°C by day.",
  },
  {
    title: "Wedding Day",
    dateISO: "2027-02-11",
    dateLabel: "February 11, 2027",
    lat: 13.2873,
    lon: 77.5738,
    accent: "rose",
    seasonalNote:
      "Mid-February in Bengaluru is dry and pleasant — typically ~30°C by day cooling to a comfortable ~16°C at night.",
  },
];

const FORECAST_WINDOW_DAYS = 16;

type Forecast = {
  code: number;
  tMax: number;
  tMin: number;
  precip: number | null;
};

type Status =
  | { state: "loading" }
  | { state: "ready"; forecast: Forecast }
  | { state: "soon" }
  | { state: "error" };

function daysUntil(dateISO: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function weatherInfo(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Clear sky" };
  if (code <= 2) return { icon: "🌤️", label: "Mainly clear" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if (code <= 48) return { icon: "🌫️", label: "Fog" };
  if (code <= 57) return { icon: "🌦️", label: "Drizzle" };
  if (code <= 67) return { icon: "🌧️", label: "Rain" };
  if (code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code <= 82) return { icon: "🌦️", label: "Rain showers" };
  if (code <= 86) return { icon: "🌨️", label: "Snow showers" };
  return { icon: "⛈️", label: "Thunderstorm" };
}

const ACCENT: Record<Accent, { eyebrow: string; card: string; link: string }> = {
  amber: {
    eyebrow: "text-amber-700",
    card: "border-amber-200/70 from-amber-50/80 to-orange-100/40",
    link: "text-amber-700 hover:text-amber-800",
  },
  rose: {
    eyebrow: "text-rose-600",
    card: "border-rose-200/70 from-rose-50/80 to-pink-100/50",
    link: "text-rose-600 hover:text-rose-700",
  },
};

export default function Weather() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(
      EVENTS.map((e) => [e.title, { state: "loading" } as Status]),
    ),
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load(
      event: EventWeather,
    ): Promise<{ title: string; status: Status } | null> {
      const days = daysUntil(event.dateISO);
      if (days < 0 || days > FORECAST_WINDOW_DAYS) {
        return { title: event.title, status: { state: "soon" } };
      }
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${event.lat}` +
          `&longitude=${event.lon}` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
          `&timezone=Asia%2FKolkata&start_date=${event.dateISO}&end_date=${event.dateISO}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const d = json.daily;
        if (!d || !Array.isArray(d.time) || d.time.length === 0) {
          throw new Error("no data");
        }
        const forecast: Forecast = {
          code: d.weather_code[0],
          tMax: Math.round(d.temperature_2m_max[0]),
          tMin: Math.round(d.temperature_2m_min[0]),
          precip: d.precipitation_probability_max?.[0] ?? null,
        };
        return { title: event.title, status: { state: "ready", forecast } };
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return null;
        return { title: event.title, status: { state: "error" } };
      }
    }

    Promise.all(EVENTS.map(load)).then((results) => {
      if (!active) return;
      setStatuses((prev) => {
        const next = { ...prev };
        for (const r of results) if (r) next[r.title] = r.status;
        return next;
      });
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="fade-in w-full">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          Come rain or shine
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          Weather
        </h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </div>

      <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-2">
        {EVENTS.map((event) => {
          const accent = ACCENT[event.accent];
          const status = statuses[event.title];
          return (
            <div
              key={event.title}
              className={`flex flex-col rounded-3xl border bg-gradient-to-br p-8 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)] backdrop-blur-sm ${accent.card}`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-[0.32em] ${accent.eyebrow}`}
              >
                {event.title}
              </p>
              <p className="mt-1 font-serif text-lg text-[#7a5560]">
                {event.dateLabel}
              </p>

              <div className="mt-6">
                {status.state === "loading" && (
                  <p className="text-sm italic text-[#7a5560]">
                    Checking the skies…
                  </p>
                )}

                {status.state === "ready" &&
                  (() => {
                    const info = weatherInfo(status.forecast.code);
                    return (
                      <div>
                        <div className="flex items-center gap-4">
                          <span className="text-5xl leading-none" aria-hidden>
                            {info.icon}
                          </span>
                          <div>
                            <p className="font-serif text-4xl font-light text-[#3a2030]">
                              {status.forecast.tMax}°
                              <span className="ml-1 text-2xl text-[#9a7080]">
                                / {status.forecast.tMin}°
                              </span>
                            </p>
                            <p className="text-sm text-[#7a5560]">{info.label}</p>
                          </div>
                        </div>
                        {status.forecast.precip != null && (
                          <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#9a7080]">
                            Rain chance {status.forecast.precip}%
                          </p>
                        )}
                      </div>
                    );
                  })()}

                {status.state === "soon" && (
                  <div className="flex items-start gap-4">
                    <span className="text-4xl leading-none" aria-hidden>
                      🗓️
                    </span>
                    <div>
                      <p className="font-serif text-lg text-[#3a2030]">
                        Forecast opens closer to the day
                      </p>
                      <p className="mt-1 text-sm italic text-[#7a5560]">
                        {event.seasonalNote}
                      </p>
                    </div>
                  </div>
                )}

                {status.state === "error" && (
                  <div className="flex items-start gap-4">
                    <span className="text-4xl leading-none" aria-hidden>
                      🌡️
                    </span>
                    <div>
                      <p className="font-serif text-lg text-[#3a2030]">
                        Couldn&rsquo;t reach the forecast right now
                      </p>
                      <p className="mt-1 text-sm italic text-[#7a5560]">
                        {event.seasonalNote}
                      </p>
                    </div>
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
