"use client";

// /invite3 and /kn/invite3 — the interactive, book-style invitation, built
// from the steps in "Wedding Invite Guide" (foundbyharish) and adapted to
// Punith & Pallavi's real details (two events, one photo, no music file).
//
// Flow: wine-velvet book (tap to open: cover swings in 3D, camera zooms in,
// petals fall) → first page (names typed letter by letter over a soft,
// slowly zooming photo in a gold arch) → Save the Date (pull the tassel to
// unroll the scroll, confetti, live countdown, add to calendar) → Wedding
// Festivities (3D swipe cards) → Our Story (3D photo carousel) → Location
// (illustrated map) → closing + share.
//
// Performance rules from the guide are followed: images and fonts are
// preloaded behind a loader, only transform/opacity are animated, blur is
// static (never animated), and animations keep running even if the phone
// asks for reduced motion (deliberately — the guide says so).

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import { VENUE_MAPS_URL } from "@/lib/calendar";
import type { Lang } from "@/lib/i18n";
import { INVITE_COPY, SHARE_SHORT } from "@/lib/inviteCopy";
import { INVITE3_COPY } from "@/lib/invite3Copy";

const WINE = "#6e1f2f";
const GOLD = "#c9a24a";
const CHAMPAGNE = "#ecd698";
const IVORY = "#fbf5ea";

const COUPLE = "/couple-full.jpg";
const ART = "/invite-art.jpg";

// 11:30 AM IST on 11 Feb 2027
const WEDDING_AT = Date.UTC(2027, 1, 11, 6, 0, 0);

const OTHER: Record<Lang, string> = { en: "/kn/invite3", kn: "/invite3" };

/* ───────────────────────── small helpers ───────────────────────── */

function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Letter-by-letter reveal with a soft blur-in on each letter. */
function Typed({
  text,
  start,
  delay = 0,
  step = 70,
  className = "",
}: {
  text: string;
  start: boolean;
  delay?: number;
  step?: number;
  className?: string;
}) {
  const letters = useMemo(() => graphemes(text), [text]);
  return (
    <span className={className} aria-label={text}>
      {letters.map((g, i) => (
        <span
          key={i}
          aria-hidden
          className={start ? "i3-letter" : "i3-letter-off"}
          style={start ? { animationDelay: `${delay + i * step}ms` } : undefined}
        >
          {g === " " ? " " : g}
        </span>
      ))}
    </span>
  );
}

/** Fades/blurs a block in when it first scrolls into view. */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${shown ? "i3-reveal" : "i3-reveal-off"} ${className}`}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** Gold medallion. The guide asks for a Ganesh ji emblem; this is an Om in a
 *  gold ring — swap in a Ganesh image here if one becomes available. */
function Emblem({ size = 64 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 35% 30%, #fff3c4, #d9a441 55%, #8a5a14)",
        boxShadow:
          "0 8px 18px -6px rgba(110,31,47,.5), inset 0 0 0 3px rgba(255,255,255,.35)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size - 12,
          height: size - 12,
          border: "1.5px solid rgba(110,31,47,.55)",
          color: WINE,
          fontSize: size * 0.46,
          lineHeight: 1,
          fontFamily: "'Noto Sans Devanagari', 'Kohinoor Devanagari', serif",
        }}
      >
        ॐ
      </div>
    </div>
  );
}

/** A 3D-looking rose (radial shading + spiral petals). */
function Rose({
  x,
  y,
  r,
  tone,
}: {
  x: number;
  y: number;
  r: number;
  tone: "cream" | "peach" | "pink";
}) {
  const id = `i3r-${tone}`;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} stroke="rgba(110,31,47,.25)" strokeWidth={0.6} />
      {[0.62, 0.42, 0.24].map((k, i) => (
        <path
          key={i}
          d={`M${x - r * k} ${y + i * 0.5} a${r * k} ${r * k} 0 1 1 ${r * k * 2} 0`}
          fill="none"
          stroke="rgba(110,31,47,.35)"
          strokeWidth={0.9}
        />
      ))}
      <path
        d={`M${x - r * 0.75} ${y - r * 0.25} Q${x} ${y - r * 1.1} ${x + r * 0.75} ${y - r * 0.25}`}
        fill="none"
        stroke="rgba(255,255,255,.7)"
        strokeWidth={1.1}
      />
    </g>
  );
}

// Math.cos/sin differ between Node and the browser in the last bits; round
// every derived coordinate so server HTML and client render match.
const r2 = (v: number) => Math.round(v * 100) / 100;

const LEAF =
  "M0 0 C -6.5 6 -7.5 21 -0.8 37 C -0.3 38 0.3 38 0.8 37 C 7.5 21 6.5 6 0 0Z";

function RoseDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <radialGradient id="i3r-cream" cx=".38" cy=".32" r=".85">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".6" stopColor="#fbeee0" />
          <stop offset="1" stopColor="#e8cfb0" />
        </radialGradient>
        <radialGradient id="i3r-peach" cx=".38" cy=".32" r=".85">
          <stop offset="0" stopColor="#ffe0d2" />
          <stop offset=".6" stopColor="#f7b3a0" />
          <stop offset="1" stopColor="#d9806a" />
        </radialGradient>
        <radialGradient id="i3r-pink" cx=".38" cy=".32" r=".85">
          <stop offset="0" stopColor="#ffc4d0" />
          <stop offset=".6" stopColor="#ee7a93" />
          <stop offset="1" stopColor="#b03a58" />
        </radialGradient>
        <linearGradient id="i3-leaf" x1="0" y1="0" x2="1" y2=".4">
          <stop offset="0" stopColor="#8bbd3a" />
          <stop offset="1" stopColor="#2b4a12" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A small cluster of roses and leaves (drawn in a 150×130 box). */
function RoseCluster({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 130" className={className} aria-hidden>
      {[
        [14, 64, -60, 1.1],
        [34, 96, -25, 1],
        [66, 54, -80, 1],
        [60, 100, 15, 0.9],
        [96, 66, -35, 0.85],
      ].map(([x, y, rot, sc], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
          <path d={LEAF} fill="url(#i3-leaf)" transform="scale(1.1)" />
        </g>
      ))}
      <Rose x={52} y={50} r={19} tone="cream" />
      <Rose x={24} y={86} r={14} tone="pink" />
      <Rose x={86} y={36} r={12} tone="peach" />
      <Rose x={80} y={86} r={11} tone="cream" />
      {[
        [104, 58],
        [38, 20],
        [10, 46],
        [66, 108],
        [118, 28],
      ].map(([x, y], i) => (
        <g key={i}>
          {[0, 1, 2, 3, 4].map((k) => {
            const a = (k * 72 * Math.PI) / 180;
            const cx = r2(x + Math.cos(a) * 3.6);
            const cy = r2(y + Math.sin(a) * 3.6);
            return (
              <ellipse
                key={k}
                cx={cx}
                cy={cy}
                rx={3.2}
                ry={1.8}
                transform={`rotate(${k * 72} ${cx} ${cy})`}
                fill="#fffdf6"
                stroke="#e8dcc0"
                strokeWidth={0.4}
              />
            );
          })}
          <circle cx={x} cy={y} r={1.4} fill="#e0b050" />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── effects ───────────────────────── */

function burstPetals(count = 34) {
  if (typeof document === "undefined") return;
  const box = document.createElement("div");
  box.className = "i3-fx";
  const tones = ["#f4a7b6", "#fbd0c0", "#f6e0c8", "#e98aa2"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "i3-petal";
    const size = 9 + Math.random() * 9;
    p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size * 0.7}px;background:${
      tones[i % tones.length]
    };--dx:${(Math.random() - 0.5) * 160}px;--rot:${Math.random() * 540}deg;animation-duration:${
      4.5 + Math.random() * 3.5
    }s;animation-delay:${Math.random() * 1.4}s`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  window.setTimeout(() => box.remove(), 10000);
}

function burstConfetti(originY: number, count = 46) {
  if (typeof document === "undefined") return;
  const box = document.createElement("div");
  box.className = "i3-fx";
  const tones = [GOLD, CHAMPAGNE, "#e98aa2", WINE, "#f6d27a", "#fff"];
  for (let i = 0; i < count; i++) {
    const c = document.createElement("span");
    c.className = "i3-confetti";
    const ang = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 190;
    c.style.cssText = `left:50%;top:${originY}px;width:${5 + Math.random() * 6}px;height:${
      8 + Math.random() * 8
    }px;background:${tones[i % tones.length]};--tx:${Math.cos(ang) * dist}px;--ty:${
      Math.sin(ang) * dist - 60
    }px;--rot:${Math.random() * 720}deg;animation-delay:${Math.random() * 120}ms`;
    box.appendChild(c);
  }
  document.body.appendChild(box);
  window.setTimeout(() => box.remove(), 3500);
}

/* ───────────────────────── 3D carousel ───────────────────────── */

function Carousel3D<T>({
  items,
  render,
  height,
  cardWidth,
  label,
}: {
  items: T[];
  render: (item: T, index: number, active: boolean) => ReactNode;
  height: number;
  cardWidth: number;
  label: string;
}) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const go = useCallback((d: number) => setActive((a) => (a + d + n) % n), [n]);

  function onDown(e: RPointerEvent) {
    drag.current = { x: e.clientX, id: e.pointerId };
  }
  function onUp(e: RPointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 36) go(dx < 0 ? 1 : -1);
  }

  return (
    <div aria-roledescription="carousel" aria-label={label}>
      <div
        className="relative mx-auto touch-pan-y select-none"
        style={{ height, perspective: 1100, width: "100%", maxWidth: 420 }}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
      >
        {items.map((it, i) => {
          let o = ((i - active + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
          if (n === 2) o = (i - active + 2) % 2; // 0 or +1
          const abs = Math.abs(o);
          const visible = abs <= 1;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-0"
              style={{
                width: cardWidth,
                height: "100%",
                marginLeft: -cardWidth / 2,
                transform: `translateX(${o * cardWidth * 0.78}px) translateZ(${-abs * 90}px) rotateY(${-o * 32}deg) scale(${1 - abs * 0.1})`,
                opacity: visible ? 1 - abs * 0.35 : 0,
                filter: abs ? "blur(1.5px)" : "none",
                zIndex: 10 - abs,
                pointerEvents: visible ? "auto" : "none",
                transition: "transform .5s cubic-bezier(.2,.7,.2,1), opacity .4s",
              }}
              onClick={() => !abs || go(o)}
            >
              {render(it, i, o === 0)}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1} / ${n}`}
            onClick={() => setActive(i)}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === active ? 22 : 8,
              background: i === active ? GOLD : "rgba(110,31,47,.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── sections ───────────────────────── */

function Diya() {
  return (
    <svg viewBox="0 0 46 44" width={34} height={32} aria-hidden>
      <path className="i3-flame" d="M23 3 Q30 14 23 21 Q16 14 23 3Z" fill="#ffb020" />
      <path className="i3-flame" d="M23 9 Q26.5 14 23 18.5 Q19.5 14 23 9Z" fill="#fff3b0" />
      <path d="M3 23 Q23 21 43 23 Q40 38 23 39 Q6 38 3 23Z" fill="#d9a441" />
      <ellipse cx="23" cy="24" rx="19" ry="3" fill="#7a4a10" opacity=".55" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" width={34} height={34} aria-hidden className="i3-spin">
      <path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill={CHAMPAGNE} />
      <circle cx="20" cy="20" r="3" fill={WINE} opacity=".5" />
    </svg>
  );
}

function FestivityCard({
  kind,
  eyebrow,
  title,
  date,
  time,
  note,
  venue,
  town,
}: {
  kind: "reception" | "muhurtha";
  eyebrow: string;
  title: string;
  date: string;
  time: string;
  note: string;
  venue: string;
  town: string;
}) {
  const wine = kind === "reception";
  return (
    <div
      className="relative h-full overflow-hidden rounded-[26px] p-5 text-center shadow-[0_24px_50px_-18px_rgba(110,31,47,.6)]"
      style={{
        background: wine
          ? `linear-gradient(160deg, #7a2236, #4a0f1d)`
          : IVORY,
        border: `2px solid ${GOLD}`,
        color: wine ? CHAMPAGNE : WINE,
      }}
    >
      {!wine && (
        <>
          {/* blurred scene behind the card: the illustration's marigold mandap */}
          <div
            aria-hidden
            className="absolute inset-0 scale-125 bg-cover bg-top opacity-35 blur-[6px]"
            style={{ backgroundImage: `url(${ART})` }}
          />
          <div aria-hidden className="absolute inset-0 bg-[#fbf5ea]/75" />
        </>
      )}
      {wine && (
        <>
          <span aria-hidden className="i3-twinkle absolute left-[18%] top-[14%] text-lg">✦</span>
          <span aria-hidden className="i3-twinkle absolute right-[16%] top-[22%] text-sm" style={{ animationDelay: "0.8s" }}>✦</span>
          <span aria-hidden className="i3-twinkle absolute bottom-[26%] left-[12%] text-sm" style={{ animationDelay: "1.4s" }}>✦</span>
          <span aria-hidden className="i3-twinkle absolute bottom-[18%] right-[14%] text-lg" style={{ animationDelay: "0.4s" }}>✦</span>
        </>
      )}
      <div className="relative flex h-full flex-col items-center justify-center gap-2">
        <div className="flex h-10 items-center justify-center">
          {wine ? <Sparkle /> : <Diya />}
        </div>
        <p className="i3-sans text-[0.62rem] uppercase tracking-[0.3em] opacity-80">{eyebrow}</p>
        <h3 className="i3-serif text-3xl font-medium leading-tight">{title}</h3>
        <div className="my-1 h-px w-20" style={{ background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <p className="i3-serif text-lg">{date}</p>
        <p className="i3-sans text-sm font-medium tracking-wide">{time}</p>
        <p className="i3-serif mt-1 text-sm italic opacity-80">{note}</p>
        <p className="i3-sans mt-2 text-[0.65rem] uppercase tracking-[0.2em] opacity-80">
          {venue} · {town}
        </p>
      </div>
    </div>
  );
}

function SaveTheDate({
  lang,
  eventDate,
  eventTime,
}: {
  lang: Lang;
  eventDate: string;
  eventTime: string;
}) {
  const c = INVITE3_COPY[lang];
  const [progress, setProgress] = useState(0); // 0 rolled … 1 fully open
  const [dragging, setDragging] = useState(false);
  const done = useRef(false);
  const start = useRef<{ y: number; p: number; moved: boolean } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const FULL = 250;

  const finish = useCallback(() => {
    setProgress(1);
    if (!done.current) {
      done.current = true;
      const r = sectionRef.current?.getBoundingClientRect();
      burstConfetti(r ? Math.max(120, r.top + 160) : 240);
      burstPetals(18);
    }
  }, []);

  function onDown(e: RPointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, p: progress, moved: false };
    setDragging(true);
  }
  function onMove(e: RPointerEvent) {
    const s = start.current;
    if (!s) return;
    const dy = e.clientY - s.y;
    if (Math.abs(dy) > 5) s.moved = true;
    setProgress(Math.min(1, Math.max(0, s.p + dy / FULL)));
  }
  function onUp() {
    const s = start.current;
    start.current = null;
    setDragging(false);
    if (!s) return;
    if (!s.moved || progress > 0.45) finish();
    else setProgress(0);
  }

  const h = 34 + progress * FULL;
  const open = progress > 0.55;

  // live countdown
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, WEDDING_AT - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  const parts = left === null ? null : [
    Math.floor(left / 86_400_000),
    Math.floor(left / 3_600_000) % 24,
    Math.floor(left / 60_000) % 60,
    Math.floor(left / 1000) % 60,
  ];
  const labels = [c.units.d, c.units.h, c.units.m, c.units.s];

  return (
    <section ref={sectionRef} className="relative select-none px-6 py-16 text-center">
      <Reveal>
        <h2
          className={`i3-serif ${lang === "kn" ? "text-2xl" : "text-3xl"}`}
          style={{ color: WINE }}
        >
          {c.saveTheDate}
        </h2>
        <p className="i3-sans mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-[#9a5a3a]">
          {progress === 0 ? c.pullHint : " "}
        </p>
      </Reveal>

      <div className="relative mx-auto mt-6 w-[min(86vw,330px)]">
        {/* the golden rod */}
        <div
          className="relative z-10 mx-auto h-4 rounded-full"
          style={{
            background: "linear-gradient(180deg,#fff0b3,#c9a24a 55%,#8a5a14)",
            boxShadow: "0 6px 12px -4px rgba(110,31,47,.45)",
          }}
        >
          <span className="absolute -left-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%,#fff3c4,#c9a24a 60%,#8a5a14)" }} />
          <span className="absolute -right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%,#fff3c4,#c9a24a 60%,#8a5a14)" }} />
        </div>

        {/* the scroll: rolled paper that unrolls downwards */}
        <div
          className="relative z-0 mx-auto -mt-1 w-[92%] overflow-hidden rounded-b-2xl"
          style={{
            height: h,
            transition: dragging ? "none" : "height .7s cubic-bezier(.2,.7,.2,1)",
            background:
              "linear-gradient(90deg,#e9d6a6,#fbf1d4 12%,#fffaf0 50%,#fbf1d4 88%,#e9d6a6)",
            border: `1.5px solid ${GOLD}`,
            borderTop: 0,
            boxShadow: "0 16px 30px -14px rgba(110,31,47,.5)",
          }}
        >
          {/* rolled look at the bottom while closed */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3"
            style={{ background: "linear-gradient(180deg,rgba(0,0,0,0),rgba(110,31,47,.18))" }}
          />
          <div
            className="flex h-full flex-col items-center justify-center px-4 text-center"
            style={{
              opacity: open ? 1 : 0,
              transition: "opacity .5s",
              minHeight: FULL,
            }}
          >
            <Emblem size={44} />
            <p className="i3-sans mt-3 text-[0.6rem] uppercase tracking-[0.3em]" style={{ color: "#9a5a3a" }}>
              {c.saveTheDate}
            </p>
            <p className="i3-serif mt-2 text-[1.7rem] leading-tight" style={{ color: WINE }}>
              {eventDate}
            </p>
            <p className="i3-sans mt-2 text-sm font-medium" style={{ color: WINE }}>
              {eventTime}
            </p>
          </div>
          <RoseCluster className="absolute -left-4 -top-3 h-16 w-20 opacity-95" />
          <RoseCluster className="absolute -bottom-3 -right-4 h-16 w-20 rotate-180 opacity-95" />
        </div>

        {/* cord + tassel (drag down, or tap) */}
        <div
          className="relative z-20 mx-auto flex w-10 cursor-grab touch-none flex-col items-center active:cursor-grabbing"
          style={{
            marginTop: -2,
            transform: "translateY(0)",
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="button"
          aria-label={c.pullHint}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && finish()}
        >
          <span className="h-5 w-[3px]" style={{ background: GOLD }} />
          <span
            className="block h-5 w-5 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 30%,#fff3c4,#c9a24a 60%,#8a5a14)" }}
          />
          <span
            className="mt-[-2px] block h-9 w-6"
            style={{
              background: `repeating-linear-gradient(90deg,${WINE} 0 2px,#8a2c40 2px 4px)`,
              borderRadius: "40% 40% 8px 8px",
              boxShadow: "0 6px 8px -4px rgba(0,0,0,.4)",
            }}
          />
          {progress === 0 && (
            <span aria-hidden className="i3-finger mt-2 text-2xl">
              👇
            </span>
          )}
        </div>
      </div>

      {/* countdown + calendar */}
      <Reveal className="mt-10" delay={100}>
        <div className="mx-auto flex max-w-[330px] items-stretch justify-center gap-2">
          {labels.map((l, i) => (
            <div
              key={l}
              className="flex-1 rounded-xl px-1 py-2.5"
              style={{
                background: "#fffaf0",
                border: `1px solid ${GOLD}`,
                boxShadow: "0 8px 16px -10px rgba(110,31,47,.45)",
              }}
            >
              <div className="i3-serif text-2xl tabular-nums" style={{ color: WINE }}>
                {parts ? String(parts[i]).padStart(2, "0") : "––"}
              </div>
              <div className="i3-sans text-[0.55rem] uppercase tracking-[0.2em] text-[#9a5a3a]">{l}</div>
            </div>
          ))}
        </div>
        <a
          href="/wedding.ics"
          className="i3-sans mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[0.18em]"
          style={{
            background: `linear-gradient(180deg,#8a2433,${WINE})`,
            color: "#fdf2dc",
            boxShadow: `0 10px 22px -10px rgba(110,31,47,.7), inset 0 0 0 1px rgba(236,214,152,.6)`,
          }}
        >
          <span aria-hidden>📅</span>
          {c.addToCalendar}
        </a>
      </Reveal>
    </section>
  );
}

function LocationCard({
  lang,
  venue,
  town,
  directions,
}: {
  lang: Lang;
  venue: string;
  town: string;
  directions: string;
}) {
  const c = INVITE3_COPY[lang];
  const [copied, setCopied] = useState(false);
  async function copy() {
    const text = `${venue}, ${town}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }
  return (
    <section className="relative px-6 py-14 text-center">
      <Reveal>
        <h2 className="i3-serif text-3xl" style={{ color: WINE }}>
          {c.location}
        </h2>
      </Reveal>
      <Reveal className="mt-6" delay={80}>
        <a
          href={VENUE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={directions}
          className="relative mx-auto block w-[min(88vw,340px)] overflow-hidden rounded-3xl"
          style={{ border: `2px solid ${GOLD}`, boxShadow: "0 22px 40px -18px rgba(110,31,47,.55)" }}
        >
          <svg viewBox="0 0 340 230" className="block w-full" aria-hidden>
            <rect width="340" height="230" fill="#f3ead6" />
            {/* park and river */}
            <path d="M0 150 Q60 120 120 160 T240 150 T340 175 L340 230 L0 230Z" fill="#cfe3b4" opacity=".75" />
            <path d="M-10 60 Q80 20 170 70 T350 40" fill="none" stroke="#bcd9ea" strokeWidth="16" strokeLinecap="round" />
            {/* roads */}
            {[
              "M0 110 L340 95",
              "M70 0 L95 230",
              "M200 0 L185 230",
              "M0 190 L340 170",
              "M270 0 L290 230",
            ].map((d, i) => (
              <g key={i}>
                <path d={d} stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d={d} stroke="#e5d3a6" strokeWidth="1.2" strokeDasharray="6 7" fill="none" />
              </g>
            ))}
            {[[40, 140], [130, 140], [230, 130], [310, 140], [130, 40], [240, 40]].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="26" height="18" rx="3" fill="#e8d7b5" stroke="#d6c093" strokeWidth=".8" />
            ))}
            {/* animated route */}
            <path
              d="M24 205 L70 192 Q90 150 120 124 L185 112 Q200 100 200 70 L240 46"
              fill="none"
              stroke="#c9506a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="10 9"
              className="i3-route"
            />
            <circle cx="24" cy="205" r="6" fill="#fff" stroke="#c9506a" strokeWidth="3" />
            {/* pin */}
            <g transform="translate(240 46)">
              <circle r="16" fill="#c9506a" opacity=".25" className="i3-pulse" />
              <path d="M0 4 C-11 -12 -14 -18 -14 -24 A14 14 0 1 1 14 -24 C14 -18 11 -12 0 4Z" fill={WINE} stroke="#fff" strokeWidth="2" />
              <circle cy="-24" r="5" fill={CHAMPAGNE} />
            </g>
          </svg>
          <div className="px-4 py-4" style={{ background: IVORY }}>
            <p className="i3-serif text-xl" style={{ color: WINE }}>{venue}</p>
            <p className="i3-serif text-base italic text-[#7a5560]">{town}</p>
            <p className="i3-sans mt-1 text-[0.6rem] uppercase tracking-[0.22em] text-[#9a5a3a]">{c.tapForMap}</p>
          </div>
        </a>
        <div className="i3-sans mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.16em]">
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-5 py-3"
            style={{ background: `linear-gradient(180deg,#8a2433,${WINE})`, color: "#fdf2dc", boxShadow: "0 10px 22px -10px rgba(110,31,47,.7)" }}
          >
            📍 {directions}
          </a>
          <button
            type="button"
            onClick={copy}
            aria-live="polite"
            className="rounded-full px-5 py-3 uppercase"
            style={{ border: `1px solid ${GOLD}`, color: WINE, background: "#fffaf0" }}
          >
            {copied ? `✓ ${c.addressCopied}` : `⧉ ${c.copyAddress}`}
          </button>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function Invite3({ lang }: { lang: Lang }) {
  const t = INVITE_COPY[lang];
  const c = INVITE3_COPY[lang];
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const sy = useRef<HTMLDivElement>(null);
  const [reception, wedding] = t.events;

  // preload images + fonts behind the loader
  useEffect(() => {
    let alive = true;
    const imgs = [COUPLE, ART].map(
      (src) =>
        new Promise<void>((res) => {
          const im = new Image();
          im.onload = im.onerror = () => res();
          im.src = src;
        }),
    );
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    Promise.race([
      Promise.all([...imgs, fonts]),
      new Promise((r) => window.setTimeout(r, 5000)),
    ]).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // no scrolling until the book is opened
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = phase === "open" ? prev : "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  // parallax for the corner roses
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sy.current?.style.setProperty("--sy", String(window.scrollY));
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  function openBook() {
    if (!ready || phase !== "closed") return;
    setPhase("opening");
    burstPetals(30);
    window.setTimeout(() => setPhase("open"), 2300);
  }

  const started = phase === "open";

  return (
    <div
      ref={sy}
      lang={t.htmlLang}
      className="i3-root relative isolate min-h-screen overflow-x-clip"
      style={{ background: `linear-gradient(180deg,#fbf0ea 0%,${IVORY} 30%,#f9e6e3 100%)` }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Playfair+Display:wght@400;500;600&display=swap"
        precedence="default"
      />
      <style>{CSS}</style>
      <RoseDefs />

      {/* roses fixed at the corners: bloom, sway, drift with scroll */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {[
          "left-[-30px] top-[-26px] i3-sway-a",
          "right-[-36px] top-[6%] i3-sway-b -scale-x-100",
          "left-[-34px] bottom-[-28px] i3-sway-b -scale-y-100",
          "right-[-30px] bottom-[-24px] i3-sway-a rotate-180",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute h-[104px] w-[120px] ${pos.split(" ")[0]} ${pos.split(" ")[1]}`}
            style={{
              transform: `translateY(calc(var(--sy, 0) * ${i % 2 ? -0.05 : 0.06} * 1px))`,
              willChange: "transform",
            }}
          >
            <div className={`${started ? "i3-bloom" : "i3-bud"} ${pos.split(" ").slice(2).join(" ")} h-full w-full`}>
              <RoseCluster className="h-full w-full drop-shadow-[0_8px_8px_rgba(110,31,47,.28)]" />
            </div>
          </div>
        ))}
      </div>

      <main className="relative z-[2] mx-auto max-w-[520px]">
        {/* ── 1. first page: exactly one screen ───────────────── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
          <div
            className="absolute inset-x-5 bottom-8 top-8 overflow-hidden"
            style={{
              borderRadius: "999px 999px 24px 24px",
              border: `1.5px solid ${GOLD}`,
              boxShadow: "0 24px 50px -24px rgba(110,31,47,.55)",
            }}
          >
            <div
              aria-hidden
              className="i3-kenburns absolute inset-[-6%] bg-cover bg-center"
              style={{ backgroundImage: `url(${COUPLE})`, filter: "blur(5px)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(251,245,234,.82),rgba(251,245,234,.7) 50%,rgba(251,245,234,.88))" }}
            />
          </div>

          <div className="relative flex flex-col items-center px-2">
            <Emblem size={58} />
            <p className="i3-sans mt-5 text-[0.65rem] uppercase tracking-[0.3em]" style={{ color: "#9a5a3a" }}>
              {c.together}
            </p>
            <h1 className="i3-serif mt-5 text-[2.6rem] font-medium leading-[1.08]" style={{ color: WINE }}>
              <Typed text={lang === "en" ? "Punith" : t.first} start={started} delay={700} />
              <br />
              <span
                className={`my-1 inline-block text-3xl font-normal ${started ? "i3-reveal" : "i3-reveal-off"}`}
                style={{ color: "#c9506a", animationDelay: "1700ms" }}
              >
                &amp;
              </span>
              <br />
              <Typed text={t.second} start={started} delay={2000} />
            </h1>
            <p
              className={`i3-serif mx-auto mt-6 max-w-[19rem] text-lg italic leading-snug text-[#5a3a4a] ${started ? "i3-reveal" : "i3-reveal-off"}`}
              style={{ animationDelay: "3000ms" }}
            >
              {t.invitation}
            </p>
            <div
              aria-hidden
              className={`mt-8 flex flex-col items-center gap-1 text-[#9a5a3a] ${started ? "i3-reveal" : "i3-reveal-off"}`}
              style={{ animationDelay: "3600ms" }}
            >
              <span className="i3-sans text-[0.6rem] uppercase tracking-[0.25em]">{c.scrollHint}</span>
              <span className="i3-bounce text-xl">⌄</span>
            </div>
          </div>
        </section>

        {/* ── 2. save the date ─────────────────────────────── */}
        <SaveTheDate lang={lang} eventDate={wedding.date} eventTime={wedding.time} />

        {/* ── 3. wedding festivities ───────────────────────── */}
        <section className="relative px-4 py-14 text-center">
          <Reveal>
            <h2 className="i3-serif text-3xl" style={{ color: WINE }}>
              {c.festivities}
            </h2>
            <p className="i3-sans mt-2 text-[0.6rem] uppercase tracking-[0.25em] text-[#9a5a3a]">{c.swipeHint}</p>
          </Reveal>
          <Reveal className="mt-8" delay={100}>
            <Carousel3D
              label={c.festivities}
              height={380}
              cardWidth={262}
              items={[
                {
                  kind: "reception" as const,
                  ev: reception,
                  note: c.receptionNote,
                },
                {
                  kind: "muhurtha" as const,
                  ev: wedding,
                  note: c.muhurthaNote,
                },
              ]}
              render={(it) => (
                <FestivityCard
                  kind={it.kind}
                  eyebrow={it.ev.eyebrow}
                  title={it.ev.title}
                  date={it.ev.date}
                  time={it.ev.time}
                  note={it.note}
                  venue={t.venueName}
                  town={t.venueTown}
                />
              )}
            />
          </Reveal>
        </section>

        {/* ── 4. our story ─────────────────────────────────── */}
        <section className="relative px-4 py-14 text-center">
          <Reveal>
            <h2 className="i3-serif text-3xl" style={{ color: WINE }}>
              {c.story}
            </h2>
          </Reveal>
          <Reveal className="mt-8" delay={100}>
            <Carousel3D
              label={c.story}
              height={430}
              cardWidth={250}
              items={[
                { src: COUPLE, pos: "50% 30%", cap: c.captions[0] },
                { src: ART, pos: "50% 38%", cap: c.captions[1] },
              ]}
              render={(it) => (
                <div
                  className="h-full overflow-hidden rounded-[22px] p-2"
                  style={{
                    background: "#fffaf0",
                    border: `2px solid ${GOLD}`,
                    boxShadow: "0 24px 46px -18px rgba(110,31,47,.55)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.src}
                    alt={it.cap}
                    draggable={false}
                    className="h-[345px] w-full rounded-2xl object-cover"
                    style={{ objectPosition: it.pos }}
                  />
                  <p className="i3-serif px-2 pt-3 text-lg italic" style={{ color: WINE }}>
                    {it.cap}
                  </p>
                </div>
              )}
            />
          </Reveal>
        </section>

        {/* ── 5. location ──────────────────────────────────── */}
        <LocationCard
          lang={lang}
          venue={t.venueName}
          town={t.venueTown}
          directions={t.venueSection.directions}
        />

        {/* ── 6. closing + share ───────────────────────────── */}
        <section className="relative px-6 pb-20 pt-10 text-center">
          <Reveal>
            <Emblem size={52} />
            <p className="i3-serif mx-auto mt-5 max-w-[18rem] text-2xl leading-snug" style={{ color: WINE }}>
              {c.closing}
            </p>
            <p className="i3-serif mt-3 text-lg italic text-[#7a5560]">{c.closingFrom}</p>
          </Reveal>
          <Reveal className="mt-10" delay={80}>
            <h3 className="i3-serif text-xl" style={{ color: "#3a2030" }}>
              {t.share.heading}
            </h3>
            <p className="i3-sans mb-5 mt-1 text-xs text-[#7a5560]">{t.share.note}</p>
            <ShareButtons labels={t.share} short={SHARE_SHORT[lang]} />
            <Link
              href={OTHER[lang]}
              lang={lang === "en" ? "kn" : "en"}
              className="i3-sans mt-8 inline-flex items-center gap-2 text-xs font-medium tracking-[0.06em] text-[#9a5a3a]"
            >
              <span aria-hidden>🌐</span>
              <span className="border-b border-amber-500/70 pb-0.5">{t.switchTo.label}</span>
            </Link>
          </Reveal>
        </section>
      </main>

      {/* ── 0. the book (opening) ─────────────────────────────── */}
      {phase !== "open" && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${phase === "opening" ? "i3-overlay-out" : ""}`}
          style={{ background: "radial-gradient(ellipse at 50% 40%,#fff3ee,#f6dcd8 70%)" }}
        >
          {/* blurred roses in front of and behind the book */}
          <RoseCluster className="i3-sway-a absolute -left-8 -top-6 h-36 w-44 opacity-70 blur-[3px]" />
          <RoseCluster className="i3-sway-b absolute -bottom-8 -right-8 h-36 w-44 rotate-180 opacity-70 blur-[3px]" />
          <RoseCluster className="i3-sway-b absolute right-[-30px] top-[14%] h-28 w-36 -scale-x-100 opacity-50 blur-[2px]" />

          <div
            className={phase === "opening" ? "i3-zoom" : ""}
            style={{ perspective: 1400 }}
          >
            <button
              type="button"
              onClick={openBook}
              disabled={!ready}
              aria-label={c.tapToOpen}
              className="relative block cursor-pointer"
              style={{ width: "min(72vw,300px)", aspectRatio: "3 / 4.1", transformStyle: "preserve-3d" }}
            >
              {/* first page peeking behind the cover */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-r-xl"
                style={{ background: IVORY, boxShadow: "0 30px 50px -20px rgba(110,31,47,.55)", border: `1px solid ${GOLD}` }}
              />
              {/* the cover (hinged on the left edge) */}
              <span
                aria-hidden
                className="i3-cover absolute inset-0 flex flex-col items-center justify-center rounded-r-xl"
                style={{
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg,#8a2a40,#5e1626 60%,#4a0f1d)",
                  boxShadow: "0 30px 50px -18px rgba(60,10,25,.7), inset 0 0 0 1px rgba(255,255,255,.08)",
                  transform: phase === "opening" ? "rotateY(-168deg)" : "rotateY(0deg)",
                  transition: "transform 1.5s cubic-bezier(.5,.1,.2,1)",
                }}
              >
                <span
                  className="absolute inset-3 rounded-r-lg"
                  style={{ border: `2px solid ${GOLD}` }}
                />
                <span className="absolute inset-[18px] rounded-r-md" style={{ border: `1px solid rgba(236,214,152,.5)` }} />
                <span className="absolute inset-y-0 left-0 w-3" style={{ background: "linear-gradient(90deg,rgba(0,0,0,.35),rgba(0,0,0,0))" }} />
                <Emblem size={84} />
                <span className="i3-serif mt-6 text-lg tracking-wide" style={{ color: CHAMPAGNE }}>
                  {t.first} &amp; {t.second}
                </span>
              </span>
            </button>
          </div>

          <p className="i3-sans mt-10 text-[0.7rem] uppercase tracking-[0.3em]" style={{ color: WINE }}>
            {ready ? <span className="i3-pulse-text">{c.tapToOpen}</span> : c.loading}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const CSS = `
.i3-root{font-family:'Montserrat',system-ui,sans-serif}
.i3-serif{font-family:'Playfair Display','Tiro Kannada',Georgia,serif}
.i3-sans{font-family:'Montserrat','Noto Sans Kannada',system-ui,sans-serif}
.i3-root :lang(kn) .i3-sans,.i3-root[lang=kn] .i3-sans{letter-spacing:0!important}
.i3-root[lang=kn] .i3-serif{letter-spacing:0}

@keyframes i3-letter{from{opacity:0;filter:blur(6px);transform:translateY(8px)}to{opacity:1;filter:blur(0);transform:none}}
.i3-letter{display:inline-block;opacity:0;animation:i3-letter .7s cubic-bezier(.2,.7,.2,1) forwards}
.i3-letter-off{display:inline-block;opacity:0}

@keyframes i3-reveal{from{opacity:0;transform:translateY(14px);filter:blur(5px)}to{opacity:1;transform:none;filter:blur(0)}}
.i3-reveal{animation:i3-reveal .9s cubic-bezier(.2,.7,.2,1) both}
.i3-reveal-off{opacity:0}

@keyframes i3-kenburns{from{transform:scale(1)}to{transform:scale(1.14)}}
.i3-kenburns{animation:i3-kenburns 22s ease-in-out infinite alternate;will-change:transform}

@keyframes i3-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
.i3-bounce{animation:i3-bounce 1.6s ease-in-out infinite}
@keyframes i3-finger{0%,100%{transform:translateY(-4px);opacity:.6}50%{transform:translateY(8px);opacity:1}}
.i3-finger{animation:i3-finger 1.4s ease-in-out infinite}

@keyframes i3-sway-a{0%,100%{rotate:-2.5deg}50%{rotate:2.5deg}}
@keyframes i3-sway-b{0%,100%{rotate:2deg}50%{rotate:-2.5deg}}
.i3-sway-a{animation:i3-sway-a 7s ease-in-out infinite;transform-origin:20% 20%}
.i3-sway-b{animation:i3-sway-b 8.5s ease-in-out infinite;transform-origin:80% 20%}
@keyframes i3-bloom{from{transform:scale(.55);opacity:0}to{transform:scale(1);opacity:1}}
.i3-bloom{animation:i3-bloom 1.6s cubic-bezier(.2,.8,.2,1) both}
.i3-bud{transform:scale(.55);opacity:0}

@keyframes i3-twinkle{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.i3-twinkle{animation:i3-twinkle 2.4s ease-in-out infinite}
@keyframes i3-spin{to{transform:rotate(360deg)}}
.i3-spin{animation:i3-spin 9s linear infinite}
@keyframes i3-flame{0%,100%{transform:scaleY(1) translateY(0)}50%{transform:scaleY(1.12) translateY(-1px)}}
.i3-flame{transform-box:fill-box;transform-origin:50% 100%;animation:i3-flame 1.1s ease-in-out infinite}

@keyframes i3-route{to{stroke-dashoffset:-38}}
.i3-route{animation:i3-route 1.2s linear infinite}
@keyframes i3-pulse{0%{transform:scale(.7);opacity:.5}100%{transform:scale(1.9);opacity:0}}
.i3-pulse{transform-box:fill-box;transform-origin:center;animation:i3-pulse 1.8s ease-out infinite}
@keyframes i3-pulse-text{0%,100%{opacity:.55}50%{opacity:1}}
.i3-pulse-text{animation:i3-pulse-text 1.8s ease-in-out infinite}

@keyframes i3-zoom{0%,55%{transform:scale(1)}100%{transform:scale(2.6)}}
.i3-zoom{animation:i3-zoom 2.3s cubic-bezier(.6,.1,.3,1) forwards}
@keyframes i3-overlay-out{0%,60%{opacity:1}100%{opacity:0}}
.i3-overlay-out{animation:i3-overlay-out 2.3s ease forwards}

.i3-fx{position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden}
@keyframes i3-fall{0%{transform:translate3d(0,-12vh,0) rotate(0);opacity:0}10%{opacity:1}100%{transform:translate3d(var(--dx),112vh,0) rotate(var(--rot));opacity:.9}}
.i3-petal{position:absolute;top:0;border-radius:60% 40% 60% 40%;opacity:0;animation:i3-fall linear forwards;will-change:transform}
@keyframes i3-confetti{0%{transform:translate3d(0,0,0) rotate(0);opacity:1}70%{opacity:1}100%{transform:translate3d(var(--tx),calc(var(--ty) + 220px),0) rotate(var(--rot));opacity:0}}
.i3-confetti{position:absolute;border-radius:2px;animation:i3-confetti 2.6s cubic-bezier(.15,.7,.3,1) forwards;will-change:transform}
`;
