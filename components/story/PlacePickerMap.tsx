"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { OSM_ATTRIBUTION, OSM_TILES, pinHtml } from "./mapPin";

// A small map in the chapter form. Search and share links can only get the pin
// into the right *area* (a share link names a place but carries no coordinates),
// so this is how the owner puts it on the exact spot: tap the map, or drag the
// pin.
export default function PlacePickerMap({
  lat,
  lng,
  zoom,
  onMove,
}: {
  lat: number;
  lng: number;
  zoom: number;
  onMove: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  // Latest props, readable from the async setup and Leaflet's event handlers.
  const latest = useRef({ lat, lng, zoom, onMove });
  useEffect(() => {
    latest.current = { lat, lng, zoom, onMove };
  });

  // Build the map once; it is then moved in place, not rebuilt, so panning and
  // zoom survive re-renders.
  useEffect(() => {
    let cancelled = false;
    let settle: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      const start = latest.current;
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView(
        [start.lat, start.lng],
        start.zoom,
      );
      L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: OSM_ATTRIBUTION }).addTo(map);
      const marker = L.marker([start.lat, start.lng], {
        icon: L.divIcon({
          className: "story-pin-wrap",
          html: pinHtml(),
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        }),
        draggable: true,
        alt: "Pinned place — drag to move",
      }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        latest.current.onMove(p.lat, p.lng);
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        latest.current.onMove(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = map;
      markerRef.current = marker;
      // The form is a bottom sheet that is still settling when this mounts.
      settle = setTimeout(() => map.invalidateSize(), 50);
    })();
    return () => {
      cancelled = true;
      // Closing the form inside that window would call into a removed map.
      clearTimeout(settle);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // A new search result / pasted link moves the pin and recentres. A tap the
  // owner just made already put the pin there, so this is a no-op for it.
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    const at = marker.getLatLng();
    if (Math.abs(at.lat - lat) > 1e-9 || Math.abs(at.lng - lng) > 1e-9) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom]);

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Map: tap to place the pin"
      className="story-map isolate z-0 mt-3 h-56 w-full overflow-hidden rounded-2xl border border-rose-200 bg-rose-50"
    />
  );
}
