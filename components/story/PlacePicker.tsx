"use client";

import { useEffect, useRef, useState } from "react";
import { parseCoords } from "@/lib/mapLinks";
import PlacePickerMap from "./PlacePickerMap";

export type PlaceValue = { name: string; lat: number | null; lng: number | null };

type Hit = {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

// "exact" = coordinates came from the link or the owner tapped the map.
// "area"  = only the town was found; the owner should tap the exact spot.
type Precision = "exact" | "area";

// Three ways to pin a chapter, all keyless, then fine-tune on the map:
//   1. search a town by name (Open-Meteo's geocoder, as the Weather section uses);
//   2. paste a Google Maps link — the phone's Share link works, the server
//      follows it (/api/resolve-map);
//   3. tap / drag on the map for the exact spot.
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
  const [linkText, setLinkText] = useState("");
  const [resolving, setResolving] = useState(false);
  const [precision, setPrecision] = useState<Precision>("exact");
  const [msg, setMsg] = useState<string | null>(null);

  // The link effect below runs on a debounce; it must see the latest value.
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

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
    setPrecision("area");
    setHits(null);
    setMsg("Tap the map to drop the pin on the exact spot.");
  };

  // Pasted link: coordinates in the text are used straight away; anything else
  // that looks like a link goes to the server (short links need following).
  useEffect(() => {
    const text = linkText.trim();
    if (!text) return;

    const local = parseCoords(text);
    if (local) {
      onChangeRef.current({ ...valueRef.current, lat: local.lat, lng: local.lng });
      setPrecision("exact");
      setMsg("Pinned from your link.");
      return;
    }
    if (!/https?:\/\//i.test(text)) {
      setMsg("Paste a Google Maps link, or coordinates like 13.63, 74.69.");
      return;
    }

    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      setResolving(true);
      setMsg(null);
      try {
        const res = await fetch(`/api/resolve-map?url=${encodeURIComponent(text)}`, {
          signal: ctl.signal,
        });
        const data = (await res.json()) as {
          lat?: number;
          lng?: number;
          name?: string;
          approximate?: boolean;
          matched?: string;
          error?: string;
        };
        if (!res.ok || data.lat === undefined || data.lng === undefined) {
          throw new Error(data.error ?? "Couldn't read that link.");
        }
        const current = valueRef.current;
        onChangeRef.current({
          name: current.name.trim() ? current.name : (data.name ?? ""),
          lat: data.lat,
          lng: data.lng,
        });
        setPrecision(data.approximate ? "area" : "exact");
        setMsg(
          data.approximate
            ? `Found the area around ${data.matched ?? "that place"}. Tap the map to drop the pin on the exact spot.`
            : data.matched
              ? "Found it on the map. Check the pin, and tap the map if it's off."
              : "Pinned from your link.",
        );
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setMsg(e instanceof Error ? e.message : "Couldn't read that link.");
        }
      } finally {
        if (!ctl.signal.aborted) setResolving(false);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [linkText]);

  const pinned = value.lat !== null && value.lng !== null;

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

      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-[#9a7080]">
          Or paste a Google Maps link (the Share link works)
        </span>
        <input
          type="text"
          inputMode="url"
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          placeholder="https://maps.app.goo.gl/…"
          aria-label="Google Maps link"
          className={inputClass}
        />
      </label>

      {(msg || resolving) && (
        <p role="status" className="mt-2 text-xs text-[#7a5560]">
          {resolving ? "Looking that link up…" : msg}
        </p>
      )}

      {pinned && (
        <>
          <PlacePickerMap
            lat={value.lat as number}
            lng={value.lng as number}
            zoom={precision === "exact" ? 16 : 13}
            onMove={(lat, lng) => {
              onChangeRef.current({ ...valueRef.current, lat, lng });
              setPrecision("exact");
              setMsg("Pin moved.");
            }}
          />
          <p className="mt-2 flex items-center gap-2 text-xs text-[#7a5560]">
            <span aria-hidden>📍</span>
            <span>
              Pinned at {(value.lat as number).toFixed(4)}, {(value.lng as number).toFixed(4)}
              {precision === "area" && " · approximate"}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange({ name: "", lat: null, lng: null });
                setLinkText("");
                setMsg(null);
              }}
              className="ml-auto font-medium uppercase tracking-wide text-rose-600 hover:text-rose-700"
            >
              Clear
            </button>
          </p>
        </>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-[#b79aa6]">
        Tip: in Google Maps, press and hold the exact spot, tap the coordinates
        that appear, and paste them above.
      </p>
    </div>
  );
}
