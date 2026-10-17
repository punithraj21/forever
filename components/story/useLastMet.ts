"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// A manually set "last met" date, for the times we've met but not written the
// chapter yet. Stored as a marker file in the existing public `moments` bucket —
// `meta/last-met-YYYY-MM-DD.txt` — with the date in the file NAME, so reading it
// is one uncached list call and needs no table (nothing for the owner to run in
// the SQL editor). The newest marker wins; saving uploads the new one and then
// removes the rest. If this ever moves to a table, this file is the only seam.
const BUCKET = "moments";
const DIR = "meta";
const nameFor = (date: string) => `last-met-${date}.txt`;
const dateFrom = (name: string) => name.match(/^last-met-(\d{4}-\d{2}-\d{2})\.txt$/)?.[1] ?? null;

type Marker = { name: string; date: string };

async function listMarkers(): Promise<Marker[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(DIR, {
    limit: 20,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) throw error;
  const markers: Marker[] = [];
  for (const f of data ?? []) {
    const date = dateFrom(f.name);
    if (date) markers.push({ name: f.name, date });
  }
  return markers;
}

async function removeMarkers(markers: Marker[]) {
  if (!markers.length) return;
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(markers.map((m) => `${DIR}/${m.name}`));
  if (error) throw error;
}

// Local midnight of a YYYY-MM-DD date, as an ISO string for the counter.
export function lastMetToISO(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}

export function useLastMet() {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listMarkers()
      .then((m) => alive && setDate(m[0]?.date ?? null))
      // No marker, or the list failed: the counter simply uses the latest chapter.
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(async (next: string) => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${DIR}/${nameFor(next)}`, new Blob(["x"], { type: "text/plain" }), {
        upsert: true,
        contentType: "text/plain",
      });
    if (error) throw error;
    setDate(next);
    // Tidy up older markers; if this fails the new one is still the newest.
    try {
      await removeMarkers((await listMarkers()).filter((m) => m.date !== next));
    } catch {
      /* harmless */
    }
  }, []);

  const clear = useCallback(async () => {
    await removeMarkers(await listMarkers());
    setDate(null);
  }, []);

  return { date, save, clear };
}
