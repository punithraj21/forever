// Source of the WhatsApp/social preview cards for the invitation, as an HTML
// page (not next/og): the browser shapes Kannada properly, Satori doesn't, so
// this gives a real Kannada card. NOT served as the preview itself — screenshot
// /og/card/en and /og/card/kn at 1200×630 into public/og-invite*.jpg:
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
//     --hide-scrollbars --window-size=1200,630 \
//     --screenshot=out.png http://localhost:3000/og/card/kn
// then convert to JPEG under a NEW file name (WhatsApp caches by URL).

import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "kn" }];
}

const GOLD = "#e8b960";
const CREAM = "#fdf2dc";

const COPY = {
  en: {
    eyebrow: "We are inviting you",
    first: "Punith",
    second: "Pallavi",
    blessing: "Your presence is our blessing",
    events: [
      { label: "Reception", date: "Wed, Feb 10, 2027", time: "7 PM onwards" },
      { label: "Muhurtha", date: "Thu, Feb 11, 2027", time: "11:30 AM" },
    ],
    venue: "NS Convention Hall · Doddaballapur",
  },
  kn: {
    eyebrow: "ಆತ್ಮೀಯ ಆಹ್ವಾನ",
    first: "ಪುನೀತ್",
    second: "ಪಲ್ಲವಿ",
    blessing: "ತಮ್ಮ ಆಗಮನವೇ ನಮಗೆ ಆಶೀರ್ವಾದ",
    events: [
      { label: "ಆರತಕ್ಷತೆ", date: "ಬುಧವಾರ, ಫೆಬ್ರವರಿ 10, 2027", time: "ಸಂಜೆ 7 ಗಂಟೆಯಿಂದ" },
      { label: "ಮುಹೂರ್ತ", date: "ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027", time: "ಬೆಳಿಗ್ಗೆ 11:30" },
    ],
    venue: "ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್ · ದೊಡ್ಡಬಳ್ಳಾಪುರ",
  },
} as const;

function Diamond() {
  return (
    <span
      style={{ width: 9, height: 9, background: GOLD, transform: "rotate(45deg)" }}
      className="inline-block"
    />
  );
}

export default async function Card({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "en" && lang !== "kn") notFound();
  const t = COPY[lang];
  const kn = lang === "kn";

  return (
    <>
      {/* hide Next's dev badge so screenshots come out clean */}
      <style>{`nextjs-portal{display:none!important}`}</style>
    <div
      lang={lang}
      className="relative flex flex-col items-center overflow-hidden"
      style={{
        width: 1200,
        height: 630,
        color: CREAM,
        backgroundColor: "#5c1522",
        backgroundImage:
          "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(245,185,74,0.28), transparent 70%), linear-gradient(135deg, #7a1f2b 0%, #4a0f1c 100%)",
      }}
    >
      {/* marigold toran */}
      <div className="absolute inset-x-0 top-0 flex justify-between px-[26px]">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            {Array.from({ length: i % 2 ? 3 : 5 }, (_, k) => (
              <span
                key={k}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 22,
                  marginTop: k ? -6 : -4,
                  backgroundImage: `radial-gradient(circle at 38% 32%, #fde68a 0%, ${
                    (i + k) % 4 === 0 ? "#f59e0b" : "#ea580c"
                  } 55%, #7c2d12 100%)`,
                  boxShadow: "0 3px 4px rgba(0,0,0,0.35)",
                }}
              />
            ))}
            <span
              style={{
                width: 12,
                height: 24,
                marginTop: -2,
                borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
                backgroundImage: "linear-gradient(90deg, #65a30d, #1a2e05)",
              }}
            />
          </div>
        ))}
      </div>

      {/* double gold border */}
      <div
        className="absolute"
        style={{ inset: 24, border: "2px solid rgba(232,185,96,0.65)", borderRadius: 14 }}
      />
      <div
        className="absolute"
        style={{ inset: 34, border: "1px solid rgba(232,185,96,0.3)", borderRadius: 10 }}
      />

      <div className="flex flex-col items-center" style={{ marginTop: 138 }}>
        <div
          className="flex items-center gap-[18px] font-sans uppercase"
          style={{ fontSize: kn ? 22 : 19, letterSpacing: kn ? 2 : 9, color: GOLD }}
        >
          <Diamond />
          <span>{t.eyebrow}</span>
          <Diamond />
        </div>
        <div
          className="mt-3 flex items-center font-serif"
          style={{ fontSize: kn ? 86 : 104, lineHeight: 1.1, letterSpacing: kn ? 0 : -2 }}
        >
          <span>{t.first}</span>
          <span style={{ color: GOLD, fontWeight: 600, margin: "0 22px" }}>&amp;</span>
          <span>{t.second}</span>
        </div>
        <div
          className="mt-2 font-serif italic"
          style={{ fontSize: kn ? 26 : 30, color: "rgba(253,242,220,0.85)" }}
        >
          {t.blessing}
        </div>
        <div
          style={{
            width: 200,
            height: 2,
            margin: "18px 0 18px",
            backgroundImage: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />
        <div className="flex items-center gap-9">
          {t.events.map((ev, i) => (
            <div key={ev.label} className="flex items-center gap-9">
              {i > 0 && (
                <span style={{ width: 1, height: 100, background: "rgba(232,185,96,0.55)" }} />
              )}
              <div className="flex w-[400px] flex-col items-center">
                <span
                  className="font-sans uppercase"
                  style={{ fontSize: kn ? 22 : 17, letterSpacing: kn ? 1 : 7, color: GOLD }}
                >
                  {ev.label}
                </span>
                <span
                  className={`mt-1.5 font-serif ${kn ? "" : "italic"}`}
                  style={{ fontSize: kn ? 28 : 36 }}
                >
                  {ev.date}
                </span>
                <span className="font-serif" style={{ fontSize: kn ? 24 : 28 }}>
                  {ev.time}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-5 font-sans uppercase"
          style={{ fontSize: kn ? 22 : 20, letterSpacing: kn ? 1 : 6, color: GOLD }}
        >
          {t.venue}
        </div>
      </div>
    </div>
    </>
  );
}
