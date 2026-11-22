"use client";
// "use client" is for page weight, not interactivity: as a server component
// the whole garland/mandala SVG was serialised twice — once as HTML and again
// in the RSC payload (~330 KB of a 580 KB page). As a client component the
// payload holds only a reference; the HTML is still server-rendered and
// identical (everything here is deterministic, so hydration matches).
//
// Decorative wedding backdrop for the home page — pure inline SVG/CSS, no image
// assets: warm ivory-to-blush wash, a glowing halo + slowly turning gold mandala
// behind the hero, a hanging marigold garland (toran) across the top, a faint
// lotus mandala at the foot, and a touch of paper grain.
//
// Render inside a `relative isolate` wrapper; it fills that wrapper with
// `absolute inset-0 -z-10` and ignores pointer events.

import type { ReactNode } from "react";
import GarlandMotion from "./GarlandMotion";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Concentric gold line-art mandala. Colour comes from `currentColor`. */
function Mandala({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-200 -200 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.9}
    >
      {[196, 188, 152, 122, 84, 44, 12].map((r) => (
        <circle key={r} r={r} />
      ))}
      {/* outer lace of small petals */}
      {range(24).map((i) => (
        <path
          key={`o${i}`}
          transform={`rotate(${i * 15})`}
          d="M0 -188 C 9 -179, 9 -170, 0 -161 C -9 -170, -9 -179, 0 -188Z"
        />
      ))}
      {/* main lotus ring */}
      {range(16).map((i) => (
        <path
          key={`m${i}`}
          transform={`rotate(${i * 22.5})`}
          d="M0 -150 C 20 -128, 20 -104, 0 -86 C -20 -104, -20 -128, 0 -150Z"
        />
      ))}
      {/* inner petals, offset half a step */}
      {range(16).map((i) => (
        <path
          key={`i${i}`}
          transform={`rotate(${i * 22.5 + 11.25})`}
          d="M0 -120 C 11 -108, 11 -96, 0 -86 C -11 -96, -11 -108, 0 -120Z"
        />
      ))}
      {range(8).map((i) => (
        <path
          key={`c${i}`}
          transform={`rotate(${i * 45})`}
          d="M0 -82 C 14 -66, 14 -52, 0 -40 C -14 -52, -14 -66, 0 -82Z"
        />
      ))}
      {/* beads on the outer ring */}
      {range(48).map((i) => (
        <circle
          key={`b${i}`}
          r={1.6}
          fill="currentColor"
          stroke="none"
          transform={`rotate(${i * 7.5}) translate(0 -174)`}
        />
      ))}
    </svg>
  );
}

// Marigold garland (toran), drawn to read as real flowers rather than icons:
//  - each head is ~50 frilly petal wedges in three rings, run through an SVG
//    "ruffle" filter (turbulence displacement + petal texture) and topped with a
//    spherical light/shadow overlay so it looks round, not flat;
//  - heads are packed tighter than their diameter, like a real threaded mala;
//  - every string swings on its own AND bends in the middle (the lower half is a
//    nested segment that lags behind), phase-shifted along the row like a breeze.
// Heads are <symbol>s defined once (in the swag <svg>) and reused via <use>.
const STRAND_GAP = 64; // px between strings; also the swag tile width
const STRAND_COUNT = 42; // ~2700px of coverage (clipped on narrower screens)
const PITCH = 12; // vertical px between flower heads on a string
// Math.sin differs between Node (server render) and the browser in the last
// few bits, and the ×43758 amplifies that — so the result is rounded to 4
// places, and every coordinate below to 2 (`r2`). Without this the client
// component hydrates with mismatched attributes (and the HTML is longer).
const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1e4) / 1e4;
};
const r2 = (v: number) => Math.round(v * 100) / 100;

// A frilly petal: narrow at the centre, scalloped along its outer edge.
const PETAL =
  "M0 0 L-2.3 -6.2 Q-2.1 -7.4 -1.3 -7.1 Q-0.8 -8.1 0 -7.5 Q0.8 -8.1 1.3 -7.1 Q2.1 -7.4 2.3 -6.2 Z";

type Palette = {
  base: string;
  outer: [string, string];
  mid: [string, string];
  inner: [string, string];
};
const PALETTES: Record<string, Palette> = {
  mgOrange: {
    base: "#9a3412",
    outer: ["#ea580c", "#f97316"],
    mid: ["#f97316", "#fb923c"],
    inner: ["#fb923c", "#fdba74"],
  },
  mgDeep: {
    base: "#7c2d12",
    outer: ["#c2410c", "#dc4a0c"],
    mid: ["#ea580c", "#f26a1b"],
    inner: ["#f97316", "#fb923c"],
  },
  mgGold: {
    base: "#92400e",
    outer: ["#f59e0b", "#fbbf24"],
    mid: ["#fbbf24", "#fcd34d"],
    inner: ["#fcd34d", "#fde68a"],
  },
};
const FLOWER_IDS = Object.keys(PALETTES);

function Flower({ id }: { id: string }) {
  const p = PALETTES[id];
  const ring = (
    n: number,
    scale: number,
    colors: [string, string],
    offset: number,
    key: string,
  ) =>
    range(n).map((k) => (
      <path
        key={`${key}${k}`}
        d={PETAL}
        transform={`rotate(${k * (360 / n) + offset}) scale(${scale})`}
        fill={colors[k % 2]}
        stroke="#7c2d12"
        strokeOpacity={0.28}
        strokeWidth={0.22 / scale}
      />
    ));
  return (
    <symbol id={id} viewBox="-12 -12 24 24" overflow="visible">
      <g filter="url(#ruffle)">
        <circle r={8.6} fill={p.base} />
        {ring(22, 1.28, p.outer, 0, "o")}
        {ring(18, 1.02, p.outer, 9, "p")}
        {ring(15, 0.78, p.mid, 4, "m")}
        {ring(11, 0.52, p.inner, 13, "i")}
        <circle r={1.3} fill={p.base} opacity={0.75} />
      </g>
      {/* round, lit-from-top-left volume */}
      <circle r={9.6} fill="url(#sphere)" />
    </symbol>
  );
}

function Leaf({ rotate, scale = 1 }: { rotate: number; scale?: number }) {
  return (
    <g transform={`rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0 0 C -6.5 6 -7.5 21 -0.8 37 C -0.3 38 0.3 38 0.8 37 C 7.5 21 6.5 6 0 0Z"
        fill="url(#leaf)"
      />
      <path
        d="M0 2 Q -0.6 20 0 35"
        fill="none"
        stroke="#d9f99d"
        strokeOpacity={0.55}
        strokeWidth={0.7}
      />
      {range(5).map((k) => (
        <path
          key={k}
          d={`M0 ${7 + k * 5.5} l ${k % 2 ? 3.6 : -3.6} 3.4`}
          stroke="#d9f99d"
          strokeOpacity={0.25}
          strokeWidth={0.45}
        />
      ))}
    </g>
  );
}

/** One run of flower heads, drawn bottom-up so each head overlaps the one below. */
function Heads({ i, from, count }: { i: number; from: number; count: number }) {
  return (
    <>
      {range(count)
        .reverse()
        .map((k) => {
          const n = i * 53 + from + k;
          const size = r2(23 + rand(n, 4) * 4);
          const cx = r2(13 + (rand(n, 5) - 0.5) * 1.8);
          const cy = 9 + k * PITCH;
          const r = rand(n, 7);
          return (
            <use
              key={k}
              href={`#${r > 0.82 ? "mgGold" : r > 0.62 ? "mgDeep" : "mgOrange"}`}
              x={r2(cx - size / 2)}
              y={r2(cy - size / 2)}
              width={size}
              height={size}
              transform={`rotate(${Math.floor(rand(n, 6) * 360)} ${cx} ${cy})`}
            />
          );
        })}
    </>
  );
}

// A string is a chain of SEGMENTS nested divs, each hinged at the top of its
// slice of flower heads. GarlandMotion (client) drives every hinge with a small
// wind + pendulum simulation, so the string bends and ripples like a real one.
const SEGMENTS = 4;

function Strand({ i }: { i: number }) {
  const long = i % 2 === 0;
  const total = long
    ? 11 + Math.floor(rand(i) * 4)
    : 7 + Math.floor(rand(i) * 3);
  const per = Math.ceil(total / SEGMENTS);
  const parts = range(SEGMENTS)
    .map((s) => ({ from: s * per, count: Math.min(per, total - s * per) }))
    .filter((p) => p.count > 0);

  const segment = (s: number, top: number): ReactNode => {
    const p = parts[s];
    const last = s === parts.length - 1;
    const h = p.count * PITCH;
    return (
      <div className="seg" style={{ top }}>
        {/* child first so this segment's heads paint over the joint below */}
        {!last && segment(s + 1, h)}
        <svg
          className="seg-svg"
          width={26}
          height={h + (last ? 52 : 14)}
          overflow="visible"
        >
          <Heads i={i} from={p.from} count={p.count} />
          {last && (
            <g transform={`translate(13 ${h + 4})`}>
              <Leaf rotate={-14} scale={0.92} />
              <Leaf rotate={12} scale={0.78} />
              <circle cy={36} r={2.6} fill="url(#bead)" />
            </g>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div
      className="strand"
      data-len={total}
      style={{ left: i * STRAND_GAP + STRAND_GAP / 2 - 13 }}
    >
      {segment(0, 0)}
    </div>
  );
}

function Garland() {
  // swag M0 10 Q32 30 64 10 with a head every 1/8th
  const swag = range(8).map((k) => {
    const t = k / 8;
    const x = 2 * (1 - t) * t * 32 + t * t * 64;
    const y = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 30 + t * t * 10;
    return { x: r2(x), y: r2(y), k };
  });
  return (
    <div className="garland absolute inset-x-0 top-0 h-[240px] overflow-hidden">
      <svg
        aria-hidden
        className="absolute inset-x-0 top-0 h-[64px] w-full overflow-visible"
      >
        <defs>
          <filter id="ruffle" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.6"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="1.5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="d"
            />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.35  0 0 0 0 0.1  0 0 0 0 0  0 0 0 1.1 -0.45"
              result="tex"
            />
            <feComposite in="tex" in2="d" operator="in" result="tex2" />
            <feMerge>
              <feMergeNode in="d" />
              <feMergeNode in="tex2" />
            </feMerge>
          </filter>
          <radialGradient id="sphere" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#fff7e0" stopOpacity={0.42} />
            <stop offset="42%" stopColor="#fff7e0" stopOpacity={0} />
            <stop offset="78%" stopColor="#3b0d02" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#3b0d02" stopOpacity={0.42} />
          </radialGradient>
          <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="#65a30d" />
            <stop offset="55%" stopColor="#3f6212" />
            <stop offset="100%" stopColor="#1a2e05" />
          </linearGradient>
          <radialGradient id="jasmine" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fbf7ea" />
            <stop offset="100%" stopColor="#e7dfc5" />
          </radialGradient>
          <radialGradient id="bead" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#d4a017" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          {FLOWER_IDS.map((id) => (
            <Flower key={id} id={id} />
          ))}
          <pattern
            id="swag"
            width={STRAND_GAP}
            height={64}
            patternUnits="userSpaceOnUse"
          >
            {/* mango-leaf toran (mavinele thorana) between the strings — drawn at
                both tile edges so the halves join into one leaf across tiles */}
            {[0, STRAND_GAP].map((x) => (
              <g key={x} transform={`translate(${x} 6)`}>
                <Leaf rotate={-4} scale={1.1} />
              </g>
            ))}
            {/* jasmine (mallige) buds along the top cord */}
            <path
              d={`M0 3.5 H${STRAND_GAP}`}
              stroke="#7c2d12"
              strokeOpacity={0.45}
              strokeWidth={0.8}
            />
            {range(8).map((k) => (
              <g
                key={`j${k}`}
                transform={`translate(${k * 8 + 4} 4) rotate(${k % 2 ? 24 : -24})`}
              >
                <ellipse
                  cy={3.2}
                  rx={1.9}
                  ry={3.6}
                  fill="url(#jasmine)"
                  stroke="#d6d3c4"
                  strokeWidth={0.3}
                />
                <path d="M-0.9 -0.3 L0 1 L0.9 -0.3" fill="#65a30d" />
              </g>
            ))}
            {swag.map(({ x, y, k }) => (
              <use
                key={k}
                href={`#${FLOWER_IDS[(k * 2 + 1) % 3]}`}
                x={x - 10}
                y={y - 10}
                width={20}
                height={20}
                transform={`rotate(${k * 47} ${x} ${y})`}
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="64" fill="url(#swag)" />
      </svg>
      <div className="absolute inset-x-0 top-[18px]">
        {range(STRAND_COUNT).map((i) => (
          <Strand key={i} i={i} />
        ))}
      </div>
    </div>
  );
}

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .28  0 0 0 0 .12  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

/** `quiet` mutes the big hero mandala (the invite page sets its text on an
 *  ivory sheet, and a full-strength mandala around it competes with it). */
export default function WeddingBackdrop({ quiet = false }: { quiet?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* ivory → blush wash */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff9ee_0%,#fdeee6_42%,#fbe3e3_100%)]" />
      {/* warm halo behind the hero */}
      <div className="absolute inset-x-0 top-0 h-[1000px] bg-[radial-gradient(ellipse_55%_45%_at_50%_30%,rgba(255,206,130,0.5),transparent_72%)]" />

      {/* slowly turning gold mandala */}
      <div className="absolute left-1/2 top-[90px] -translate-x-1/2">
        <Mandala
          className={`mandala-spin h-[820px] w-[820px] sm:h-[1100px] sm:w-[1100px] ${
            quiet ? "text-amber-600/[0.14]" : "text-amber-600/30"
          }`}
        />
      </div>

      {/* faint rose mandala at the foot of the page */}
      <div className="absolute -bottom-[420px] left-1/2 -translate-x-1/2">
        <Mandala className="mandala-spin-rev h-[900px] w-[900px] text-rose-500/20" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      {/* marigold toran across the top */}
      <Garland />
      <GarlandMotion />
    </div>
  );
}

/** Gold line · diamond · line divider. */
export function GoldOrnament({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-3 text-amber-600 ${className}`}
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/80 sm:w-24" />
      <span className="text-[0.7rem] leading-none">{children ?? "❖"}</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/80 sm:w-24" />
    </div>
  );
}
