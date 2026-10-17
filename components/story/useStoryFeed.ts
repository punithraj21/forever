"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, type Moment } from "@/lib/supabase";
import { extractErrorMessage, type SortOrder } from "./utils";

export const PAGE_SIZE = 6;

async function fetchPage(order: SortOrder, from: number, to: number) {
  const asc = order === "oldest";
  // A chapter's occurred_at is pinned to noon of its day, so same-day chapters
  // tie. The created_at / id tie-breakers keep offset pagination stable (no
  // dupes or gaps between pages) and, flipped together with occurred_at, keep
  // "Day N" identical in both sort directions.
  const { data, count, error } = await supabase
    .from("moments")
    .select("*", { count: "exact" })
    .order("occurred_at", { ascending: asc })
    .order("created_at", { ascending: asc })
    .order("id", { ascending: asc })
    .range(from, to);
  if (error) throw error;
  return { rows: (data ?? []) as Moment[], count: count ?? 0 };
}

async function fetchFirstDate(): Promise<string | null> {
  const { data, error } = await supabase
    .from("moments")
    .select("occurred_at")
    .order("occurred_at", { ascending: true })
    .limit(1);
  if (error) throw error;
  return data?.[0]?.occurred_at ?? null;
}

// PostgREST answers 416 / PGRST103 when the requested offset is past the end
// (e.g. rows were deleted elsewhere since the last page).
function isRangeError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "PGRST103"
  );
}

/**
 * Offset-paginated feed of chapters in the given order. `loadMore` appends the
 * next page; `reload` re-fetches everything currently loaded in one request
 * (used after add / edit / delete so the list keeps its length and the scroll
 * position doesn't jump).
 */
export function useStoryFeed(order: SortOrder) {
  const [items, setItems] = useState<Moment[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [firstDate, setFirstDate] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsRef = useRef<Moment[]>([]);
  const busy = useRef(false);
  // Bumped on every reset / reload so a late response from an older request
  // can't overwrite newer state.
  const epoch = useRef(0);

  const commit = useCallback((next: Moment[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const mine = epoch.current;
    setFetching(true);
    setLoadingMore(true);
    setError(null);
    try {
      const from = itemsRef.current.length;
      const { rows, count } = await fetchPage(order, from, from + PAGE_SIZE - 1);
      if (mine !== epoch.current) return;
      const seen = new Set(itemsRef.current.map((m) => m.id));
      const fresh = rows.filter((m) => !seen.has(m.id));
      commit([...itemsRef.current, ...fresh]);
      // An empty page means we've hit the end however `count` reads; stopping
      // here also rules out a request loop.
      setTotal(fresh.length === 0 ? itemsRef.current.length : count);
    } catch (err) {
      if (mine !== epoch.current) return;
      if (isRangeError(err)) setTotal(itemsRef.current.length);
      else setError(extractErrorMessage(err));
    } finally {
      if (mine === epoch.current) {
        busy.current = false;
        setFetching(false);
        setLoadingMore(false);
      }
    }
  }, [order, commit]);

  const reload = useCallback(async () => {
    const mine = ++epoch.current;
    busy.current = true;
    setFetching(true);
    setLoadingMore(false);
    try {
      const size = Math.max(itemsRef.current.length, PAGE_SIZE);
      const [{ rows, count }, first] = await Promise.all([
        fetchPage(order, 0, size - 1),
        fetchFirstDate().catch(() => null),
      ]);
      if (mine !== epoch.current) return;
      commit(rows);
      setTotal(count);
      setFirstDate(first);
      setError(null);
    } catch (err) {
      if (mine !== epoch.current) return;
      if (isRangeError(err)) {
        commit([]);
        setTotal(0);
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      if (mine === epoch.current) {
        busy.current = false;
        setFetching(false);
      }
    }
  }, [order, commit]);

  // First page; also restarts from scratch whenever the sort order flips.
  useEffect(() => {
    epoch.current += 1;
    busy.current = false;
    commit([]);
    setTotal(null);
    setError(null);
    setFetching(false);
    setLoadingMore(false);
    loadMore();
  }, [order, commit, loadMore]);

  useEffect(() => {
    fetchFirstDate()
      .then(setFirstDate)
      .catch(() => {});
  }, []);

  const hasMore = total !== null && items.length < total;

  return {
    items,
    total,
    firstDate,
    fetching,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reload,
  };
}
