import { Heart } from "./icons";

// A typographic tile that sits in the wall's grid just before a month's first
// chapter. Month headings used to be full-width rows, which left half-empty
// rows behind every month; as a grid cell they keep the wall dense.
export default function MonthTile({
  month,
  year,
}: {
  month: string;
  year: string;
}) {
  return (
    <div className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-3xl border border-rose-200/70 bg-white/45 p-4 sm:p-5">
      <div
        aria-hidden
        className="absolute inset-x-6 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300 opacity-70"
      />
      <Heart size={14} className="text-rose-300" />
      <h2 className="mt-auto font-serif text-3xl font-light leading-none tracking-tight text-[#3a2030] sm:text-4xl">
        {month}
      </h2>
      <p className="mt-1.5 font-serif text-lg italic text-[#9a7080]">{year}</p>
      <div
        aria-hidden
        className="mt-3 h-px w-12 bg-gradient-to-r from-rose-300 to-transparent"
      />
    </div>
  );
}
