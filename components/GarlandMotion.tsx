"use client";

// Drives the marigold garland in WeddingBackdrop with a tiny physics model
// instead of a looping CSS keyframe, so it moves like real flowers on a string:
//
//  - Wind = a soft, ever-changing breeze (a few incommensurate sines, varying
//    along x so neighbouring strings differ) + occasional gusts that travel
//    across the row and fade out.
//  - Each string is a chain of hinged segments (.seg, nested). The top segment
//    is a damped pendulum pushed by the wind; every lower segment is pulled
//    toward its parent's angle by a spring, so motion ripples down the string
//    with a natural lag and settles slowly after a gust.
//  - Longer strings swing a little slower (pendulum frequency ~ 1/sqrt(length)).
//
// Renders nothing; it writes transforms onto the server-rendered .strand/.seg
// elements. Pauses when the garland is off-screen or the tab is hidden, and does
// nothing at all for prefers-reduced-motion.

import { useEffect } from "react";

type Strand = {
  x: number;
  segs: HTMLElement[];
  phi: Float64Array; // absolute angle of each segment (rad, + = clockwise)
  vel: Float64Array;
  g: number; // pendulum stiffness for the top segment
  seed: number;
};

type Gust = {
  x: number;
  speed: number;
  width: number;
  strength: number;
  age: number;
  life: number;
};

const COUPLING = 34; // spring pulling a segment toward its parent's angle
const DAMPING = 1.6; // per-second velocity damping (light: settles slowly)
const MAX_ANGLE = 0.45; // rad clamp, just a safety net

export default function GarlandMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const strands: Strand[] = Array.from(
      document.querySelectorAll<HTMLElement>(".strand"),
    ).map((el, idx) => {
      const segs = Array.from(el.querySelectorAll<HTMLElement>(".seg")); // pre-order = top → bottom
      const len = Number(el.dataset.len) || 10;
      return {
        x: el.offsetLeft + 13,
        segs,
        phi: new Float64Array(segs.length),
        vel: new Float64Array(segs.length),
        g: 70 / len, // ~5–10 → periods of roughly 2–3 s
        seed: idx * 1.618 + 0.37,
      };
    });
    if (strands.length === 0) return;

    const gusts: Gust[] = [];
    let nextGust = 1.5 + Math.random() * 3;
    const span = Math.max(window.innerWidth, 800);

    const wind = (x: number, t: number, seed: number) => {
      // gentle breeze: slow, irregular, phase-shifted along the row
      let w =
        0.22 * Math.sin(0.53 * t - x * 0.0042 + seed * 0.2) +
        0.14 * Math.sin(1.31 * t + x * 0.0027 + seed) +
        0.08 * Math.sin(2.17 * t - x * 0.011 + seed * 1.7);
      for (const g of gusts) {
        const d = (x - g.x) / g.width;
        const fade = Math.sin(Math.PI * Math.min(1, g.age / g.life)); // rise & fall
        w += g.strength * fade * Math.exp(-d * d);
      }
      return w;
    };

    let t = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;

    const step = (dt: number) => {
      t += dt;

      // spawn / advance gusts (mostly left→right, sometimes the other way)
      nextGust -= dt;
      if (nextGust <= 0) {
        const dir = Math.random() < 0.75 ? 1 : -1;
        gusts.push({
          x: dir > 0 ? -300 : span + 300,
          speed: dir * (280 + Math.random() * 260),
          width: 220 + Math.random() * 220,
          strength: 0.7 + Math.random() * 0.9,
          age: 0,
          life: (span + 600) / 400,
        });
        nextGust = 4 + Math.random() * 7;
      }
      for (let k = gusts.length - 1; k >= 0; k--) {
        const g = gusts[k];
        g.x += g.speed * dt;
        g.age += dt;
        if (g.age >= g.life) gusts.splice(k, 1);
      }

      for (const s of strands) {
        const w = wind(s.x, t, s.seed);
        const n = s.segs.length;
        for (let j = 0; j < n; j++) {
          const parent = j === 0 ? 0 : s.phi[j - 1];
          const restoring =
            j === 0 ? -s.g * s.phi[0] : COUPLING * (parent - s.phi[j]);
          // wind pushes lower (lighter, freer) segments a touch more
          const push = w * (0.55 + 0.12 * j);
          const acc = restoring + push - DAMPING * s.vel[j];
          s.vel[j] += acc * dt;
          s.phi[j] += s.vel[j] * dt;
          if (s.phi[j] > MAX_ANGLE) s.phi[j] = MAX_ANGLE;
          else if (s.phi[j] < -MAX_ANGLE) s.phi[j] = -MAX_ANGLE;
        }
      }
    };

    const render = () => {
      for (const s of strands) {
        for (let j = 0; j < s.segs.length; j++) {
          // nested segments: each rotates relative to its parent
          const rel = j === 0 ? s.phi[0] : s.phi[j] - s.phi[j - 1];
          s.segs[j].style.transform =
            `rotate(${(-rel * 57.2958).toFixed(3)}deg)`;
        }
      }
    };

    const frame = (now: number) => {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // after a stall, don't explode
      // fixed sub-steps keep the spring chain stable
      const sub = 4;
      for (let k = 0; k < sub; k++) step(dt / sub);
      render();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // warm up so the strings are already gently moving on first paint
    for (let k = 0; k < 240; k++) step(1 / 60);
    render();

    const garland = strands[0].segs[0].closest(".garland") ?? document.body;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(garland);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
