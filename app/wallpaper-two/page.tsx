"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DAY_MS = 1000 * 60 * 60 * 24;
const FLIP_MS = 600;

type Time = { days: number; hours: number; minutes: number; seconds: number };

function getTime(target: Date): Time {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

const pad = (n: number, w = 2) => n.toString().padStart(w, "0");

function ordinalSuffix(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function FlipDigit({ value, big = false }: { value: string; big?: boolean }) {
  const [from, setFrom] = useState(value);
  const [to, setTo] = useState(value);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (value !== to) {
      setFrom(to);
      setTo(value);
      setAnimKey((k) => k + 1);
    }
  }, [value, to]);

  useEffect(() => {
    if (from !== to) {
      const id = window.setTimeout(() => setFrom(to), FLIP_MS);
      return () => window.clearTimeout(id);
    }
  }, [from, to, animKey]);

  const animating = from !== to;
  const sizeClass = big ? "flip-big" : "flip-small";

  return (
    <div className={`flip-card ${sizeClass}`}>
      <div className="flip-half flip-top">
        <div className="flip-num flip-num-top">{to}</div>
      </div>
      <div className="flip-half flip-bottom">
        <div className="flip-num flip-num-bottom">{from}</div>
      </div>
      {animating && (
        <>
          <div key={`t${animKey}`} className="flip-flap flip-flap-top">
            <div className="flip-num flip-num-top">{from}</div>
          </div>
          <div key={`b${animKey}`} className="flip-flap flip-flap-bottom">
            <div className="flip-num flip-num-bottom">{to}</div>
          </div>
        </>
      )}
      <div className="flip-divider" />
    </div>
  );
}

function Colon({ big = false }: { big?: boolean }) {
  return (
    <div
      className={`mx-1 flex flex-col items-center justify-center gap-2 ${
        big ? "h-[80px] sm:h-[104px]" : "h-[52px] sm:h-[68px]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/85 sm:h-2 sm:w-2" />
      <span className="h-1.5 w-1.5 rounded-full bg-white/85 sm:h-2 sm:w-2" />
    </div>
  );
}

type Props = {
  target: Date;
  eyebrow: string;
};

function CountdownPanel({ target, eyebrow }: Props) {
  const [t, setT] = useState<Time | null>(null);

  useEffect(() => {
    setT(getTime(target));
    const id = setInterval(() => setT(getTime(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const day = target.getDate();
  const month = target.toLocaleDateString("en-US", { month: "long" });

  const daysStr = (t?.days ?? 0).toString().padStart(3, "0");
  const hh = pad(t?.hours ?? 0);
  const mm = pad(t?.minutes ?? 0);
  const ss = pad(t?.seconds ?? 0);

  return (
    <div className="fade-in flex flex-col items-center text-center text-white">
      <div className="flex flex-col items-center">
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/95 ring-1 ring-white/15 backdrop-blur-sm">
          {eyebrow}
        </span>
        <h2 className="mt-3 font-light leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-4xl sm:text-5xl lg:text-6xl">
          {day}
          <span className="align-super text-[0.5em]">{ordinalSuffix(day)}</span>{" "}
          {month}
        </h2>
      </div>

      <div className="mt-7 flex flex-col items-center gap-3">
        <div className="flex items-end justify-center gap-1.5">
          {daysStr.split("").map((d, i) => (
            <FlipDigit key={`d${i}`} value={d} big />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.36em] text-white/70">
          Days
        </p>

        <div className="mt-1 flex items-end gap-1">
          {hh.split("").map((d, i) => (
            <FlipDigit key={`h${i}`} value={d} />
          ))}
          <Colon />
          {mm.split("").map((d, i) => (
            <FlipDigit key={`m${i}`} value={d} />
          ))}
          <Colon />
          {ss.split("").map((d, i) => (
            <FlipDigit key={`s${i}`} value={d} />
          ))}
        </div>
        <div className="grid w-full max-w-[300px] grid-cols-3 text-[9px] font-bold uppercase tracking-[0.22em] text-white/65 sm:text-[10px]">
          <span className="text-center">Hours</span>
          <span className="text-center">Minutes</span>
          <span className="text-center">Seconds</span>
        </div>
      </div>
    </div>
  );
}

const LEAVES = Array.from({ length: 18 }, (_, i) => {
  const left = (i * 6.3) % 100;
  const delay = (i * 0.9) % 14;
  const duration = 12 + ((i * 1.7) % 11);
  const size = 8 + ((i * 3) % 9);
  const palette = ["#d68a4a", "#b35a32", "#e0b070", "#a04528", "#c87a3a"];
  const color = palette[i % palette.length];
  const drift = ((i * 13) % 80) - 40;
  return { left, delay, duration, size, color, drift, key: i };
});

export default function WallpaperTwoPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevBg = body.style.background;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.background = "transparent";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.background = prevBg;
    };
  }, []);

  return (
    <main
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(120deg, #07211f 0%, #0e2a30 28%, #1a1d2a 52%, #2a1828 74%, #1a0a14 100%)",
      }}
    >
      <style>{`
        @keyframes leaf-fall {
          0%   { transform: translate3d(0, -12vh, 0) rotate(0deg);   opacity: 0; }
          8%   { opacity: 0.7; }
          50%  { transform: translate3d(var(--drift, 0px), 50vh, 0) rotate(360deg); }
          100% { transform: translate3d(calc(var(--drift, 0px) * 1.6), 112vh, 0) rotate(720deg); opacity: 0.35; }
        }
        .leaf {
          position: absolute;
          top: 0;
          border-radius: 50%;
          animation-name: leaf-fall;
          animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
        }

        .flip-card {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1d22;
          box-shadow: 0 6px 18px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04);
          perspective: 800px;
          flex-shrink: 0;
        }
        .flip-big   { width: 64px;  height: 80px;  }
        .flip-small { width: 40px;  height: 52px;  }
        @media (min-width: 640px) {
          .flip-big   { width: 84px;  height: 104px; }
          .flip-small { width: 52px;  height: 68px;  }
        }

        .flip-half, .flip-flap {
          position: absolute;
          left: 0;
          right: 0;
          height: 50%;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flip-top {
          top: 0;
          background: linear-gradient(180deg, #2c3035 0%, #232629 100%);
        }
        .flip-bottom {
          bottom: 0;
          background: linear-gradient(180deg, #1c1f23 0%, #16181c 100%);
        }
        .flip-flap-top {
          top: 0;
          background: linear-gradient(180deg, #2c3035 0%, #232629 100%);
          transform-origin: bottom;
          z-index: 3;
          animation: flap-top 0.3s cubic-bezier(0.55, 0, 0.85, 0.4) forwards;
        }
        .flip-flap-bottom {
          bottom: 0;
          background: linear-gradient(180deg, #1c1f23 0%, #16181c 100%);
          transform-origin: top;
          transform: rotateX(90deg);
          z-index: 3;
          animation: flap-bottom 0.3s cubic-bezier(0.15, 0.5, 0.5, 1) 0.3s forwards;
        }
        @keyframes flap-top {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-90deg); }
        }
        @keyframes flap-bottom {
          0%   { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }

        .flip-num {
          position: absolute;
          left: 0;
          right: 0;
          height: 200%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f4f4f6;
          font-weight: 300;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .flip-num-top    { top: 0; }
        .flip-num-bottom { bottom: 0; }

        .flip-big   .flip-num { font-size: 56px; }
        .flip-small .flip-num { font-size: 36px; }
        @media (min-width: 640px) {
          .flip-big   .flip-num { font-size: 76px; }
          .flip-small .flip-num { font-size: 50px; }
        }

        .flip-divider {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(0, 0, 0, 0.7);
          z-index: 4;
          pointer-events: none;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        {LEAVES.map((l) => (
          <span
            key={l.key}
            className="leaf"
            style={{
              left: `${l.left}%`,
              width: `${l.size * 2}px`,
              height: `${l.size}px`,
              background: l.color,
              transform: "rotate(35deg)",
              animationDelay: `-${l.delay}s`,
              animationDuration: `${l.duration}s`,
              ["--drift" as string]: `${l.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-evenly px-6 py-8 sm:px-12 sm:py-10">
        <header className="fade-in text-center">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.36em] text-white/70 sm:text-xs">
            With love
          </p>
          <h1 className="font-serif text-4xl font-light tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">
            Punith <span className="text-rose-300">&</span> Pallavi
          </h1>
          <p className="mx-auto mt-2 font-serif text-sm italic text-white/75 sm:text-base lg:text-lg">
            Counting down to forever
          </p>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </header>

        <div className="grid w-full max-w-6xl gap-10 sm:gap-14 lg:grid-cols-2">
          <CountdownPanel
            eyebrow="Engagement"
            target={new Date("2026-06-21T00:00:00")}
          />
          <CountdownPanel
            eyebrow="Wedding"
            target={new Date("2027-02-11T11:30:00")}
          />
        </div>

        <div className="flex w-full max-w-5xl items-center justify-center">
          <div className="flex items-center gap-3 rounded-full bg-white/8 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/80 ring-1 ring-white/10 backdrop-blur-md sm:text-xs">
            <span aria-hidden>✦</span>
            The Promise · Then forever
            <span aria-hidden>❀</span>
          </div>
        </div>
      </div>

      <Link
        href="/wallpaper"
        title="Switch to classic theme"
        className="fixed bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/20 sm:text-xs"
      >
        <span aria-hidden>↺</span> Classic theme
      </Link>
    </main>
  );
}
