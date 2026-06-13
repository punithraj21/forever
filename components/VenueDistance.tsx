"use client";

// "Distance to the Venue" — opt-in geolocation. On tap we read the visitor's
// position via the browser Geolocation API and compute straight-line (haversine)
// distance to each venue, entirely client-side — the coordinates are never
// stored or sent anywhere. We don't auto-prompt: the user taps to consent.
// Requires a secure context (HTTPS or localhost), which both dev and the Vercel
// deploy satisfy.

import { useEffect, useState } from "react";

type Accent = "amber" | "rose";

type Venue = {
  eyebrow: string;
  emoji: string;
  venue: string;
  lat: number;
  lon: number;
  mapUrl: string;
  accent: Accent;
};

const VENUES: Venue[] = [
  {
    eyebrow: "Engagement",
    emoji: "✦",
    venue: "Shri Manjunatha Grand Veg",
    lat: 13.2802724,
    lon: 77.5545281,
    mapUrl: "https://maps.app.goo.gl/TjT39YazGP5VF4AaA",
    accent: "amber",
  },
  {
    eyebrow: "Wedding Day",
    emoji: "❀",
    venue: "NS Convention Halls",
    lat: 13.2872715,
    lon: 77.5738031,
    mapUrl: "https://maps.app.goo.gl/DEe8rXU4ch4fGqxf7",
    accent: "rose",
  },
];

const ACCENT: Record<Accent, { card: string; eyebrow: string; link: string }> = {
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
};

// Great-circle distance in km.
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function fmtDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

type Status = "unsupported" | "idle" | "loading" | "ready" | "denied" | "error";

export default function VenueDistance() {
  const [status, setStatus] = useState<Status>("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
    }
  }, []);

  function locate() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("ready");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <section className="fade-in w-full">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          From you to us
        </p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
          Distance to the Venue
        </h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </div>

      {status === "ready" && coords ? (
        <>
          <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-2">
            {VENUES.map((v) => {
              const accent = ACCENT[v.accent];
              const km = haversineKm(coords.lat, coords.lon, v.lat, v.lon);
              return (
                <div
                  key={v.venue}
                  className={`flex flex-col rounded-3xl border bg-gradient-to-br p-8 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.2)] backdrop-blur-sm ${accent.card}`}
                >
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.32em] ${accent.eyebrow}`}
                  >
                    <span aria-hidden className="mr-1.5">
                      {v.emoji}
                    </span>
                    {v.eyebrow}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl font-light tracking-tight text-[#3a2030]">
                    {v.venue}
                  </h3>
                  <p className="mt-5 font-serif text-5xl font-light text-[#3a2030]">
                    {fmtDistance(km)}
                  </p>
                  <p className="mt-1 text-sm italic text-[#7a5560]">
                    away · as the crow flies
                  </p>
                  <a
                    href={v.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] transition ${accent.link}`}
                  >
                    Get directions <span aria-hidden>→</span>
                  </a>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-[#9a7080]">
            Straight-line distance, computed in your browser ·{" "}
            <button
              type="button"
              onClick={locate}
              className="underline decoration-rose-300 underline-offset-2 hover:text-[#7a5560]"
            >
              recalculate
            </button>
          </p>
        </>
      ) : (
        <div className="mx-auto max-w-md text-center">
          {status === "unsupported" ? (
            <p className="font-serif text-lg italic text-[#7a5560]">
              Your browser can&rsquo;t share location — but you can still get
              directions from the map above.
            </p>
          ) : status === "loading" ? (
            <p className="text-sm italic text-[#7a5560]">Locating you…</p>
          ) : status === "denied" ? (
            <div>
              <p className="font-serif text-lg italic text-[#7a5560]">
                Location access was blocked — no worries at all.
              </p>
              <button
                type="button"
                onClick={locate}
                className="mt-4 rounded-full bg-rose-500 px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600"
              >
                Try again
              </button>
            </div>
          ) : status === "error" ? (
            <div>
              <p className="font-serif text-lg italic text-[#7a5560]">
                Couldn&rsquo;t pin down your location just now.
              </p>
              <button
                type="button"
                onClick={locate}
                className="mt-4 rounded-full bg-rose-500 px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600"
              >
                Try again
              </button>
            </div>
          ) : (
            <div>
              <p className="font-serif text-lg italic text-[#7a5560]">
                Curious how far you are from the celebrations?
              </p>
              <button
                type="button"
                onClick={locate}
                className="mt-5 rounded-full bg-rose-500 px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-sm transition hover:bg-rose-600"
              >
                📍 Show my distance
              </button>
              <p className="mt-4 text-xs text-[#9a7080]">
                Your location stays on your device — we don&rsquo;t store or send
                it anywhere.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
