export type SortOrder = "oldest" | "newest";

export function formatCardDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTileDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatMonthName(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long" });
}

export function formatYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric" });
}

export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Local-calendar month key, so grouping matches what formatMonthYear displays.
export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

// <input type="date"> wants the *local* calendar date. toISOString() is UTC,
// which is "yesterday" for anyone east of UTC shortly after midnight.
export function toDateInputValue(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Supabase errors are plain objects, not Error instances.
export function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.error_description === "string") {
      return obj.error_description;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }
  return String(err ?? "Unknown error");
}

// Whole calendar days between two timestamps, by local date (so "11 Jun 23:00"
// to "12 Jun 01:00" is 1 day, and DST can't skew it). Direction-agnostic.
export function calendarDaysBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso);
  const b = new Date(bIso);
  const da = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const db = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round(Math.abs(db - da) / 86_400_000);
}

export function formatGap(days: number): string {
  if (days <= 0) return "same day";
  return `${days} ${days === 1 ? "day" : "days"} apart`;
}

export function formatWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long" });
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function dayOfMonth(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, "0");
}
