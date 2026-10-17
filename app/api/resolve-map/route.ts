import { NextResponse } from "next/server";
import {
  firstUrl,
  geocodeQueries,
  isAllowedMapsHost,
  isShortLinkHost,
  parseCoords,
  placeNameFromText,
  placeTextFromMapsUrl,
} from "@/lib/mapLinks";

// Turns a pasted Google Maps link into a place. Short links (maps.app.goo.gl —
// what the Share button gives you) can't be read from the browser, because a
// cross-origin redirect is opaque there, so the server follows them.
//
// Today's share links land on a place-ID URL that carries NO coordinates, only
// the place's name and address (checked: Google's page has none either, for any
// user agent). So we geocode that text with OpenStreetMap's Nominatim. When
// OpenStreetMap lists the place itself the pin lands on it; when only the town
// is found the pin is `approximate: true`. Either way the form's mini map lets
// the owner tap the exact spot.

export const dynamic = "force-dynamic";

const UA =
  "forever.devshark.site (personal wedding site; resolves Google Maps share links)";
const TIMEOUT_MS = 8000;

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Follow redirects ourselves, hop by hop, re-checking the host each time: the
// route must never be steered to a non-Google host. Stops as soon as it is on a
// real Maps URL — that page is a JS shell, so there is nothing to gain by
// loading it.
async function followShortLink(start: string): Promise<string> {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    if (!isShortLinkHost(new URL(url).hostname)) return url;
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const location = res.headers.get("location");
    if (!location) return url;
    let next = new URL(location, url);
    // Consent interstitials wrap the real URL in `?continue=`.
    if (next.hostname.startsWith("consent.") && next.searchParams.get("continue")) {
      next = new URL(next.searchParams.get("continue")!);
    }
    if (next.protocol !== "https:" || !isAllowedMapsHost(next.hostname)) {
      throw new Error("redirected outside Google Maps");
    }
    url = next.toString();
  }
  return url;
}

// "Mulbagal, Karnataka, India" -> "Mulbagal, Karnataka": the town as Google
// spelled it, which is what the owner will recognise (OpenStreetMap's own
// transliteration of the same town can differ).
const friendly = (query: string) => query.replace(/,\s*India$/i, "");

async function geocode(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
    {
      headers: { "user-agent": UA, "accept-language": "en" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) return null;
  const hits = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
    category?: string;
  }[];
  const hit = hits[0];
  if (!hit) return null;
  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    // A town / district / road is only "the area"; a temple, hall or shop is
    // the place itself.
    isArea: ["place", "boundary", "highway", "waterway", "landuse"].includes(hit.category ?? ""),
  };
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  if (raw.length > 600) return json({ error: "That's too long to be a map link." }, 400);

  let start: URL;
  try {
    start = new URL(firstUrl(raw) ?? "");
  } catch {
    return json({ error: "Paste a Google Maps link." }, 400);
  }
  if (start.protocol !== "https:" || !isAllowedMapsHost(start.hostname)) {
    return json({ error: "That doesn't look like a Google Maps link." }, 400);
  }

  try {
    const finalUrl = await followShortLink(start.toString());
    const text = placeTextFromMapsUrl(finalUrl);
    const name = text ? placeNameFromText(text) : "";

    // A dropped pin (or an older-style link) does carry exact coordinates.
    const exact = parseCoords(finalUrl);
    if (exact) return json({ ...exact, name, approximate: false });

    if (!text) {
      return json({ error: "That link doesn't point at a specific place." }, 422);
    }

    // Nominatim asks for at most one request per second.
    const queries = geocodeQueries(text);
    for (let i = 0; i < queries.length; i++) {
      if (i > 0) await sleep(1100);
      const hit = await geocode(queries[i]);
      if (hit) {
        return json({
          lat: hit.lat,
          lng: hit.lng,
          name,
          approximate: hit.isArea,
          matched: friendly(queries[i]),
        });
      }
    }
    return json(
      { error: `Couldn't find “${name || "that place"}” on the map. Search by town instead.` },
      404,
    );
  } catch {
    return json({ error: "Couldn't follow that link right now. Try again, or search by town." }, 502);
  }
}
