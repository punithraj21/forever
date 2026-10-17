import type { OverviewPlace } from "./useStoryOverview";

// "Mulbāgal, Karnataka" and "mulbagal,  karnataka" are the same place to a
// reader, whichever geocoder spelled it and wherever its pin was dropped.
export function placeKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// The list under the map: one card per place NAME (pins that sit a little apart
// but carry the same name are still one place to read about), newest first —
// the cards ordered by their most recent chapter, and the chapters inside each
// card the same way. The map keeps its own grouping by exact spot (one pin per
// location); this is only the reading list.
export function groupPlacesByName(places: OverviewPlace[]): OverviewPlace[][] {
  const groups = new Map<string, OverviewPlace[]>();
  for (const p of places) {
    const key = placeKey(p.placeName);
    const g = groups.get(key);
    if (g) g.push(p);
    else groups.set(key, [p]);
  }
  const byNewest = (a: OverviewPlace, b: OverviewPlace) =>
    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  const out = [...groups.values()];
  for (const g of out) g.sort(byNewest);
  out.sort((a, b) => byNewest(a[0], b[0]));
  return out;
}
