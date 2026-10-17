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
  // False until supabase/places.sql has been run (the columns don't exist yet).
  placesEnabled: boolean;
};

const BASE_COLS = "id, occurred_at, created_at, title, note, image_paths";
const PLACE_COLS = "place_name, lat, lng";

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

function fetchAll(cols: string) {
  // Same three-key order as the paginated feed, so both agree on what is next to what
  // (and so the "days apart" between neighbours is the same everywhere).
  return supabase
    .from("moments")
    .select(cols)
    .order("occurred_at", { ascending: true })
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
}

// Postgres "undefined_column": the place columns haven't been added yet.
function isMissingColumn(err: { code?: string; message?: string }): boolean {
  return err.code === "42703" || /column .* does not exist/i.test(err.message ?? "");
}

function build(rows: Row[], placesEnabled: boolean): Overview {
  const photos: OverviewPhoto[] = [];
  const places: OverviewPlace[] = [];
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
      let placesEnabled = true;
      let res = await fetchAll(`${BASE_COLS}, ${PLACE_COLS}`);
      if (res.error && isMissingColumn(res.error)) {
        placesEnabled = false;
        res = await fetchAll(BASE_COLS);
      }
      if (res.error) throw res.error;
      setOverview(build((res.data ?? []) as unknown as Row[], placesEnabled));
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
