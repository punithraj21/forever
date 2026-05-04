import Countdown from "@/components/Countdown";
import Journey from "@/components/Journey";
import MomentsSection from "@/components/MomentsSection";

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
          targetISO="2026-12-14T00:00:00"
          accent="rose"
          emoji="❀"
        />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <Journey />
      </div>

      <div className="mt-16 w-full sm:mt-24">
        <MomentsSection />
      </div>

      <section className="fade-in mt-16 max-w-2xl text-center sm:mt-24">
        <p className="font-serif text-xl italic leading-relaxed text-[#5a3a4a] sm:text-2xl">
          &ldquo;Love does not consist of gazing at each other,
          but in looking outward together in the same direction.&rdquo;
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#9a7080]">
          — Antoine de Saint-Exupéry
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
