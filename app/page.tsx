import Link from "next/link";
import Countdown from "@/components/Countdown";
import Journey from "@/components/Journey";
import EventDetails from "@/components/EventDetails";
import VenueMap from "@/components/VenueMap";
import Weather from "@/components/Weather";
import AdviceWall from "@/components/AdviceWall";

// Toggle the home-page "Our Story" CTA card. Hidden until Punith asks to surface it.
// The /moments route stays live regardless — flip this to `true` to re-show the card.
const SHOW_OUR_STORY_CTA = false;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-5 py-14 sm:py-20">
      <header className="fade-in mb-12 text-center sm:mb-16">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
          With love
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight text-[#3a2030] sm:text-6xl">
          Punith <span className="text-rose-400">&</span> Pallavi
        </h1>
        <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-[#7a5560] sm:text-xl">
          Counting down to forever
        </p>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
      </header>

      <div className="grid w-full gap-6 sm:gap-8 lg:grid-cols-2">
        <Countdown
          title="Engagement"
          subtitle="The Promise"
          targetISO="2026-06-21T00:00:00"
          accent="amber"
          emoji="✦"
        />
        <Countdown
          title="Wedding Day"
          subtitle="The Forever"
          targetISO="2027-02-11T11:30:00"
          accent="rose"
          emoji="❀"
        />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <Journey />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <EventDetails />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <VenueMap />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <Weather />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <AdviceWall />
      </div>

      {SHOW_OUR_STORY_CTA && (
        <div className="mt-16 w-full sm:mt-24">
          <Link
            href="/moments"
            className="fade-in group mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/80 to-pink-100/60 p-10 text-center shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] backdrop-blur-sm transition hover:shadow-[0_30px_70px_-15px_rgba(180,80,110,0.35)]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
              chapter by chapter
            </p>
            <h3 className="font-serif text-3xl font-light tracking-tight text-[#3a2030] sm:text-4xl">
              Our Story
            </h3>
            <p className="font-serif text-base italic text-[#7a5560]">
              Read every chapter, from the day we met.
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.22em] text-rose-600 transition-all group-hover:gap-3">
              Open our story <span aria-hidden>→</span>
            </span>
          </Link>
        </div>
      )}

      <section className="fade-in mt-16 max-w-2xl text-center sm:mt-24">
        <p className="font-serif text-xl italic leading-relaxed text-[#5a3a4a] sm:text-2xl">
          &ldquo;Compromise, communicate, and never go to bed angry - the three
          pieces of advice to our happy life.&rdquo;
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#9a7080]">
          — Punith Raj
        </p>
      </section>

      <footer className="fade-in mt-16 text-center text-sm text-[#9a7080] sm:mt-20">
        <p className="font-serif italic">
          Every second brings us closer, Punith &amp; Pallavi.
        </p>
      </footer>
    </main>
  );
}
