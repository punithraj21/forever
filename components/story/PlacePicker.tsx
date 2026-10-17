"use client";

import { useState } from "react";
import { parseCoords } from "./utils";

export type PlaceValue = { name: string; lat: number | null; lng: number | null };

type Hit = {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

// Two ways to pin a chapter, both keyless: search a town by name (Open-Meteo's
// geocoder, the same free service the Weather section uses), or paste a
// Google Maps link for an exact spot like a particular temple.
export default function PlacePicker({
  value,
  onChange,
  inputClass,
}: {
  value: PlaceValue;
  onChange: (v: PlaceValue) => void;
  inputClass: string;
}) {
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const search = async () => {
    const q = value.name.trim();
    if (!q) {
      setMsg("Type a place name first.");
      return;
    }
    setSearching(true);
    setMsg(null);
    setHits(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,
      );
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = (await res.json()) as { results?: Hit[] };
      const results = json.results ?? [];
      setHits(results);
      if (results.length === 0) {
        setMsg("No match. Try a nearby town, or paste a Google Maps link below.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const pick = (h: Hit) => {
    onChange({
      name: [h.name, h.admin1].filter(Boolean).join(", "),
      lat: h.latitude,
      lng: h.longitude,
    });
    setHits(null);
    setMsg(null);
  };

  const onLink = (text: string) => {
    const c = parseCoords(text);
    if (c) {
      onChange({ ...value, lat: c.lat, lng: c.lng });
      setMsg("Pinned from your link.");
    } else if (text.trim()) {
      setMsg(
        "Couldn't find coordinates there. Use the full link from the browser's address bar (short share links don't include them), or search above.",
      );
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.22em] text-rose-600">
        Place (optional)
      </span>
      <div className="flex gap-2">
        <input
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          onKeyDown={(e) => {
            // Enter here must search, not submit the whole chapter form.
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="Kundapura"
          maxLength={120}
          aria-label="Place name"
          className={`${inputClass} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={search}
          disabled={searching}
          className="shrink-0 rounded-2xl border border-rose-200 bg-white/70 px-4 text-xs font-medium uppercase tracking-[0.18em] text-rose-700 transition hover:bg-white disabled:opacity-60"
        >
          {searching ? "…" : "Find"}
        </button>
      </div>

      {hits && hits.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-2xl border border-rose-200 bg-white">
          {hits.map((h) => (
            <li key={h.id} className="border-t border-rose-100 first:border-t-0">
              <button
                type="button"
                onClick={() => pick(h)}
                className="block w-full px-4 py-2.5 text-left text-sm text-[#3a2030] transition hover:bg-rose-50"
              >
                {h.name}
                <span className="text-[#9a7080]">
                  {[h.admin1, h.country].filter(Boolean).map((s) => `, ${s}`).join("")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.lat !== null && value.lng !== null && (
        <p className="mt-2 flex items-center gap-2 text-xs text-[#7a5560]">
          <span aria-hidden>📍</span>
          Pinned at {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          <button
            type="button"
            onClick={() => onChange({ name: "", lat: null, lng: null })}
            className="ml-auto font-medium uppercase tracking-wide text-rose-600 hover:text-rose-700"
          >
            Clear
          </button>
        </p>
      )}

      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-[#9a7080] hover:text-rose-600">
          Or paste a Google Maps link for an exact spot
        </summary>
        <input
          type="text"
          onChange={(e) => onLink(e.target.value)}
          placeholder="https://www.google.com/maps/place/…"
          aria-label="Google Maps link"
          className={`${inputClass} mt-2`}
        />
      </details>

      {msg && <p className="mt-2 text-xs text-[#7a5560]">{msg}</p>}
    </div>
  );
}
