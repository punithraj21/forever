// Pure helpers for turning whatever the owner pastes from Google Maps into a
// place. Shared by the form (instant, offline parsing) and the
// /api/resolve-map route (short links need a server to follow the redirect).

const NUM = "(-?\\d+(?:\\.\\d+)?)";

// Pulls coordinates out of a full Google Maps URL (`!3dLAT!4dLNG` is the place
// itself, `@lat,lng` only the viewport centre, so it is tried second), a
// `?q=lat,lng` link, or a bare "lat, lng". Returns null when there are none —
// which is what today's *share* links are: they point at a place ID, not a spot.
export function parseCoords(text: string): { lat: number; lng: number } | null {
  const patterns = [
    new RegExp(`!3d${NUM}!4d${NUM}`),
    new RegExp(`@${NUM},${NUM}`),
    new RegExp(`[?&](?:q|ll|query|destination)=${NUM}(?:,|%2C)${NUM}`, "i"),
    new RegExp(`^\\s*${NUM}\\s*[, ]\\s*${NUM}\\s*$`),
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (!m) continue;
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

// Android's Share sheet pastes "Place name\nhttps://maps.app.goo.gl/…", so take
// the first URL out of whatever text arrives.
export function firstUrl(text: string): string | null {
  const m = /https?:\/\/[^\s<>"']+/i.exec(text);
  return m ? m[0].replace(/[),.;]+$/, "") : null;
}

export function isShortLinkHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "goo.gl" || h.endsWith(".goo.gl");
}

// The only hosts the resolver will contact — for the pasted link AND every
// redirect hop — so it can't be turned into a general-purpose fetch proxy.
export function isAllowedMapsHost(host: string): boolean {
  const h = host.toLowerCase();
  return isShortLinkHost(h) || /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(h);
}

// "/maps/place/Some+Temple,+Town,+Karnataka+563131,+India/data=…" -> the text,
// or a non-coordinate `?q=Place+Name`.
export function placeTextFromMapsUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const m = /\/maps\/place\/([^/]+)/.exec(u.pathname);
    if (m) {
      const t = decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
      if (t) return t;
    }
    const q = u.searchParams.get("q") ?? u.searchParams.get("query");
    if (q && !parseCoords(q)) return q.trim() || null;
  } catch {
    /* fall through */
  }
  return null;
}

// "Temple, TOWN, near the school, Village, Town, State 563131, India" ->
// ["Temple", "Village", "Town", "State", "India"]: the address segments worth
// geocoding (postal codes, "TOWN" placeholders and "near …" hints dropped).
function addressParts(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim().replace(/\s+\d{5,6}$/, "")) // "Karnataka 563131" -> "Karnataka"
    .filter((s) => s && !/^(town|village|city)$/i.test(s) && !/^near\b/i.test(s));
}

// The place's own name, on its own. Google often labels a place with a
// different village than OpenStreetMap does ("Boyakonda Gangamma Temple,
// Diguvapalle" — 110 km from the temple's real spot), so the full address can
// fail or land on the wrong town while the bare name finds the temple itself.
// A bare name can also match a namesake elsewhere, so the caller must check the
// hit is in `state`.
export function nameQuery(text: string): { query: string; state: string | null } | null {
  const parts = addressParts(text);
  if (parts.length < 3) return null; // geocodeQueries already tries the whole text
  const last = parts[parts.length - 1];
  const state = /^india$/i.test(last) ? parts[parts.length - 2] : last;
  return { query: parts[0], state: state || null };
}

// Geocoder queries, most specific first. A share link's address reads
// "Temple, TOWN, near the school, Village, Town, State 563131, India"; the
// first segment is the name and the tail is the locality. Never goes coarser
// than town level — a state-level pin would be worse than no pin.
export function geocodeQueries(text: string): string[] {
  const parts = addressParts(text);
  const out: string[] = [];
  const add = (q: string) => {
    if (q && !out.includes(q)) out.push(q);
  };
  if (parts.length >= 4) add(`${parts[0]}, ${parts.slice(-3).join(", ")}`);
  if (parts.length >= 4) add(parts.slice(-4).join(", "));
  if (parts.length >= 3) add(parts.slice(-3).join(", "));
  if (parts.length <= 2) add(parts.join(", "));
  return out;
}

export function placeNameFromText(text: string): string {
  return text.split(",")[0].trim();
}
