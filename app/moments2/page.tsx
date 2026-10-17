import Link from "next/link";
import StoryFeed from "@/components/story/StoryFeed";

export const metadata = {
  title: "Our Story — Punith & Pallavi",
  description: "Chapter by chapter, from the day we met.",
};

export default function Moments2Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:py-14">
      <div className="fade-in mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.22em] text-[#a06a7c] transition hover:text-rose-700"
        >
          <span aria-hidden>←</span> Back to countdown
        </Link>
        <p className="font-serif text-sm italic text-[#9a7080]">
          Punith &amp; Pallavi
        </p>
      </div>

      <StoryFeed />

      <footer className="mt-20 pb-16 text-center text-sm text-[#9a7080]">
        <p className="font-serif italic">
          Every second brings us closer, Punith &amp; Pallavi.
        </p>
      </footer>
    </main>
  );
}
