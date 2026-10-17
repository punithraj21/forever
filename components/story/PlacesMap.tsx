"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { OverviewPlace } from "./useStoryOverview";
import { formatShortDate } from "./utils";

// Chapters at the same spot share one pin (two temple visits in the same town
// must not stack invisibly).
export function groupPlaces(places: OverviewPlace[]): OverviewPlace[][] {
  const groups = new Map<string, OverviewPlace[]>();
  for (const p of places) {
    const key = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
    const g = groups.get(key);
    if (g) g.push(p);
    else groups.set(key, [p]);
  }
  return [...groups.values()];
}

const HEART =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="#fff" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

export default function PlacesMap({
  places,
  onRead,
}: {
  places: OverviewPlace[];
  onRead: (momentId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  });

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      // Leaflet touches `window`, so it only ever loads in the browser, and only
      // when this tab is opened.
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      map = L.map(ref.current, {
        scrollWheelZoom: false, // don't hijack page scrolling
        dragging: !L.Browser.mobile, // one finger scrolls the page on phones
        zoomSnap: 0.5,
      });
      // OpenStreetMap's own tiles: keyless, and light personal-site traffic is
      // within their tile policy. (CARTO's public tiles now return an
      // "API KEY REQUIRED" placeholder image, so they can't be used.) The warm
      // tint lives in globals.css (.story-map).
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      for (const group of groupPlaces(places)) {
        const first = group[0];
        const icon = L.divIcon({
          className: "story-pin-wrap",
          html: `<div class="story-pin">${HEART}${
            group.length > 1 ? `<span class="story-pin-count">${group.length}</span>` : ""
          }</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -30],
        });
        const marker = L.marker([first.lat, first.lng], {
          icon,
          title: `${first.placeName} — ${group.length} ${group.length === 1 ? "chapter" : "chapters"}`,
          alt: first.placeName,
        }).addTo(map);

        const root = document.createElement("div");
        root.className = "story-popup";
        const name = document.createElement("p");
        name.className = "story-popup-place";
        name.textContent = first.placeName;
        root.append(name);
        for (const p of group) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "story-popup-link";
          b.textContent = `${formatShortDate(p.occurredAt)}${p.title ? ` · ${p.title}` : ""} →`;
          b.addEventListener("click", () => onReadRef.current(p.momentId));
          root.append(b);
        }
        marker.bindPopup(root, { closeButton: false, minWidth: 180 });
        bounds.extend([first.lat, first.lng]);
      }

      if (bounds.isValid()) {
        if (places.length === 1 || bounds.getSouthWest().equals(bounds.getNorthEast())) {
          map.setView(bounds.getCenter(), 11);
        } else {
          map.fitBounds(bounds, { padding: [56, 56], maxZoom: 12 });
        }
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [places]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Map of the places we sought blessings"
      className="story-map h-[26rem] w-full overflow-hidden rounded-3xl border border-rose-200/70 bg-rose-50 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] sm:h-[32rem]"
    />
  );
}
