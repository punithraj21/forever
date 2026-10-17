"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calendarDaysBetween, extractErrorMessage } from "./utils";

export type OverviewPhoto = {
  path: string;
  momentId: string;
  title: string | null;
  occurredAt: string;
};

export type OverviewPlace = {
  momentId: string;
  title: string | null;
  placeName: string;
  lat: number;
  lng: number;
  occurredAt: string;
  cover: string | null;
};

// One chapter, as the calendar needs it: enough to preview it without opening it.
export type OverviewMeeting = {
  momentId: string;
  title: string | null;
  occurredAt: string;
  excerpt: string | null;
  cover: string | null;
};

export type Overview = {
  total: number;
  firstDate: string | null;
  // The most recent entry — "since we last met" counts from here.
  lastDate: string | null;
  lastTitle: string | null;
  photoCount: number;
  wordCount: number;
  // Longest stretch between two consecutive entries, in calendar days.
  longestGapDays: number;
  photos: OverviewPhoto[]; // oldest first
  places: OverviewPlace[]; // oldest first
  meetings: OverviewMeeting[]; // every chapter, oldest first
  // False until supabase/places.sql has been run (the columns don't exist yet).
  placesEnabled: boolean;
};

type Row = {
  id: string;
  occurred_at: string;
  title: string | null;
  note: string | null;
  image_paths: string[] | null;
  place_name?: string | null;
  lat?: number | null;
  lng?: number | null;
};

function fetchAll() {
  // Same three-key order as the paginated feed, so both agree on what is next to what
  // (and so the "days apart" between neighbours is the same everywhere).
  //
  // `select("*")` rather than naming columns: naming the place columns before
  // supabase/places.sql has run is a 400 on every page load. With `*` the query
  // never errors, and whether the columns exist is read off the rows instead.
  return supabase
    .from("moments")
    .select("*")
    .order("occurred_at", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
}

function excerptOf(note: string | null): string | null {
  const t = (note ?? "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > 150 ? `${t.slice(0, 147).trimEnd()}…` : t;
}

function build(rows: Row[]): Overview {
  // Rows carry a `lat` key (null or not) only once the columns exist. With no
  // rows there is nothing to pin yet, so "not enabled" is harmless.
  const placesEnabled = rows.length > 0 && "lat" in rows[0];
  const photos: OverviewPhoto[] = [];
  const places: OverviewPlace[] = [];
  const meetings: OverviewMeeting[] = [];
  let wordCount = 0;
  let longestGapDays = 0;

  rows.forEach((r, i) => {
    if (i > 0) {
      longestGapDays = Math.max(
        longestGapDays,
        calendarDaysBetween(rows[i - 1].occurred_at, r.occurred_at),
      );
    }
    wordCount += (r.note ?? "").split(/\s+/).filter(Boolean).length;
    const paths = r.image_paths ?? [];
    meetings.push({
      momentId: r.id,
      title: r.title,
      occurredAt: r.occurred_at,
      excerpt: excerptOf(r.note),
      cover: paths[0] ?? null,
    });
    for (const path of paths) {
      photos.push({
        path,
        momentId: r.id,
        title: r.title,
        occurredAt: r.occurred_at,
      });
    }
    if (
      typeof r.lat === "number" &&
      typeof r.lng === "number" &&
      Number.isFinite(r.lat) &&
      Number.isFinite(r.lng)
    ) {
      places.push({
        momentId: r.id,
        title: r.title,
        placeName: r.place_name?.trim() || r.title || "A place we went",
        lat: r.lat,
        lng: r.lng,
        occurredAt: r.occurred_at,
        cover: paths[0] ?? null,
      });
    }
  });

  return {
    total: rows.length,
    firstDate: rows[0]?.occurred_at ?? null,
    lastDate: rows[rows.length - 1]?.occurred_at ?? null,
    lastTitle: rows[rows.length - 1]?.title ?? null,
    photoCount: photos.length,
    wordCount,
    longestGapDays,
    photos,
    places,
    meetings,
    placesEnabled,
  };
}

/**
 * One lightweight pass over every chapter, for the parts of the page that
 * aren't paginated: the numbers, the photo gallery, and the places map. The
 * chapter list itself stays paginated (useStoryFeed).
 */
export function useStoryOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const refreshOverview = useCallback(async () => {
    try {
      const res = await fetchAll();
      if (res.error) throw res.error;
      setOverview(build((res.data ?? []) as unknown as Row[]));
      setOverviewError(null);
    } catch (err) {
      setOverviewError(extractErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    refreshOverview();
  }, [refreshOverview]);

  return { overview, overviewError, refreshOverview };
}
