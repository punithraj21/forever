"use client";

import SectionHeader from "./SectionHeader";
import PlacesMap from "./PlacesMap";
import { groupPlacesByName, placeKey } from "./placeGroups";
import { Heart } from "./icons";
import type { Overview } from "./useStoryOverview";
import { formatShortDate } from "./utils";

const SETUP_SQL = `alter table public.moments
  add column if not exists place_name text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;`;

export default function PlacesTab({
  overview,
  unlocked,
  onRead,
}: {
  overview: Overview;
  unlocked: boolean;
  onRead: (momentId: string) => void;
}) {
  const { places, placesEnabled } = overview;
  const groups = groupPlacesByName(places);

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader
        eyebrow="places of blessing"
        title="Where We Sought Blessings"
        subtitle="every pin is a chapter"
      />

      {!placesEnabled ? (
        // Only the owner ever sees this tab until the columns exist.
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-100/50 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-700">
            one-time setup
          </p>
          <p className="mt-2 font-serif text-xl text-[#3a2030]">
            Run this once in the Supabase SQL editor to switch places on.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-amber-200/70 bg-white/70 p-4 text-xs leading-relaxed text-[#5a3a4a]">
            {SETUP_SQL}
          </pre>
          <p className="mt-3 text-sm text-[#7a5560]">
            It&rsquo;s also saved as <code>supabase/places.sql</code>. Afterwards,
            open a chapter&rsquo;s ⋯ menu → Edit to give it a place.
          </p>
        </div>
      ) : places.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-rose-200 bg-white/40 p-10 text-center">
          <p className="font-serif text-xl italic text-[#7a5560]">
            No places pinned yet.
          </p>
          {unlocked && (
            <p className="mt-2 text-sm text-[#7a5560]">
              Open a chapter&rsquo;s ⋯ menu → Edit and add a place, and it will
              appear here.
            </p>
          )}
        </div>
      ) : (
        <>
          <PlacesMap places={places} onRead={onRead} />

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {groups.map((group) => (
              <li
                key={placeKey(group[0].placeName)}
                className="rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-pink-100/50 p-4"
              >
                <p className="flex items-center gap-2 font-serif text-xl text-[#3a2030]">
                  <Heart size={14} className="shrink-0 text-rose-400" />
                  {group[0].placeName}
                </p>
                <ul className="mt-2 space-y-1">
                  {group.map((p) => (
                    <li key={p.momentId}>
                      <button
                        type="button"
                        onClick={() => onRead(p.momentId)}
                        className="text-left text-sm text-[#7a5560] transition hover:text-rose-700"
                      >
                        <span className="font-medium text-rose-600">
                          {formatShortDate(p.occurredAt)}
                        </span>
                        {p.title ? ` · ${p.title}` : ""} →
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
