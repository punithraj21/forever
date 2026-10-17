// Date helpers for the Calendar tab. Everything works on local "YYYY-MM-DD" day
// keys (chapters are pinned to local noon, so a key is stable), and compares them
// as strings or through UTC day numbers, so daylight-saving never shifts a day.

export type MonthRef = { year: number; month0: number };

// The wedding day. Matches WEDDING in Journey.tsx / StoryNumbers.tsx / app/page.tsx
// (the site keeps these as separate constants).
export const WEDDING_DAY_KEY = "2027-02-11";

const pad = (n: number) => String(n).padStart(2, "0");

export const dayKey = (year: number, month0: number, day: number) =>
  `${year}-${pad(month0 + 1)}-${pad(day)}`;

const parse = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m0: m - 1, d };
};

export const monthOfKey = (key: string): MonthRef => {
  const { y, m0 } = parse(key);
  return { year: y, month0: m0 };
};

export function monthTitle({ year, month0 }: MonthRef): string {
  return new Date(year, month0, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** Whole days from one key to another (negative if `to` is earlier). */
export function diffDays(from: string, to: string): number {
  const a = parse(from);
  const b = parse(to);
  return Math.round((Date.UTC(b.y, b.m0, b.d) - Date.UTC(a.y, a.m0, a.d)) / 86_400_000);
}

/**
 * The cells of one month's grid, Sunday-first: `null` for the blank cells
 * before the 1st, then the day numbers. (No trailing blanks — the grid simply
 * ends.)
 */
export function monthCells({ year, month0 }: MonthRef): (number | null)[] {
  const lead = new Date(year, month0, 1).getDay();
  const count = new Date(year, month0 + 1, 0).getDate();
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
}

/** Every month from the one containing `fromKey` to the one containing `toKey`, newest first. */
export function monthsNewestFirst(fromKey: string, toKey: string): MonthRef[] {
  const a = monthOfKey(fromKey);
  const b = monthOfKey(toKey);
  const out: MonthRef[] = [];
  let y = b.year;
  let m = b.month0;
  while (y > a.year || (y === a.year && m >= a.month0)) {
    out.push({ year: y, month0: m });
    m -= 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
  }
  return out;
}

/** Average days between consecutive meeting days (sorted, unique keys), or null with fewer than two. */
export function averageGapDays(sortedKeys: string[]): number | null {
  if (sortedKeys.length < 2) return null;
  const span = diffDays(sortedKeys[0], sortedKeys[sortedKeys.length - 1]);
  return Math.max(1, Math.round(span / (sortedKeys.length - 1)));
}
