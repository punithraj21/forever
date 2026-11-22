// Link-preview card for the invitation page (/invite, /kn/invite): names plus
// both events. Like /og/wedding this is NOT served live (per-request rendering
// exceeds the Workers CPU limit, error 1102) — open /og/invite locally, save the
// PNG over public/og-invite.png and bump the ?v= in the invite pages.

import { ImageResponse } from "next/og";

// No `runtime = "edge"`: OpenNext on Cloudflare Workers doesn't support the
// edge runtime (same fix as app/share/engagement/og/route.tsx).

async function loadGoogleFont(family: string, weight: number, italic = false) {
  // v1 CSS endpoint with no User-Agent → Google serves TTF, which Satori can read
  // (same approach as app/share/engagement/og/route.tsx).
  const url = `https://fonts.googleapis.com/css?family=${family.replace(/ /g, "+")}:${weight}${
    italic ? "i" : ""
  }`;
  const css = await fetch(url).then((r) => r.text());
  const match = css.match(
    /src:\s*url\((https:\/\/[^)]+\.ttf)\)\s*format\('truetype'\)/,
  );
  if (!match)
    throw new Error(`Could not parse TTF URL for ${family} ${weight}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

const GOLD = "#e8b960";
const CREAM = "#fdf2dc";

// Small marigold head for the top garland (plain shapes Satori can render).
function Marigold({ size, color }: { size: number; color: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        display: "flex",
        backgroundImage: `radial-gradient(circle at 38% 32%, #fde68a 0%, ${color} 55%, #7c2d12 100%)`,
        boxShadow: "0 3px 4px rgba(0,0,0,0.35)",
      }}
    />
  );
}

export async function GET() {
  const [corm400, corm600, cormItalic, inter500] = await Promise.all([
    loadGoogleFont("Cormorant Garamond", 400),
    loadGoogleFont("Cormorant Garamond", 600),
    loadGoogleFont("Cormorant Garamond", 400, true),
    loadGoogleFont("Inter", 500),
  ]);

  const strands = Array.from({ length: 15 }, (_, i) => i);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        backgroundColor: "#5c1522",
        backgroundImage:
          "radial-gradient(ellipse 60% 70% at 50% 48%, rgba(245,185,74,0.28), transparent 70%), linear-gradient(135deg, #7a1f2b 0%, #4a0f1c 100%)",
        fontFamily: "Inter",
        color: CREAM,
      }}
    >
      {/* marigold toran across the top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: "0 26px",
        }}
      >
        {strands.map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {Array.from({ length: i % 2 ? 4 : 6 }, (_, k) => (
              <div key={k} style={{ display: "flex", marginTop: k ? -6 : -4 }}>
                <Marigold
                  size={22}
                  color={(i + k) % 4 === 0 ? "#f59e0b" : "#ea580c"}
                />
              </div>
            ))}
            <div
              style={{
                width: 12,
                height: 26,
                marginTop: -2,
                borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
                backgroundImage: "linear-gradient(90deg, #65a30d, #1a2e05)",
                display: "flex",
              }}
            />
          </div>
        ))}
      </div>

      {/* double gold border */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          bottom: 24,
          border: `2px solid rgba(232,185,96,0.65)`,
          borderRadius: 14,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 34,
          right: 34,
          bottom: 34,
          border: `1px solid rgba(232,185,96,0.3)`,
          borderRadius: 10,
          display: "flex",
        }}
      />

      {/* centre content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 165,
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 9,
            textTransform: "uppercase",
            color: GOLD,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              backgroundColor: GOLD,
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
          <span>You are invited</span>
          <div
            style={{
              width: 9,
              height: 9,
              backgroundColor: GOLD,
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: "Cormorant Garamond",
            fontSize: 112,
            lineHeight: 1,
            letterSpacing: -2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>Punith</span>
          <span style={{ color: GOLD, fontWeight: 600, margin: "0 22px" }}>
            &
          </span>
          <span>Pallavi</span>
        </div>
        <div
          style={{
            width: 200,
            height: 2,
            marginTop: 30,
            marginBottom: 26,
            backgroundImage: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 400,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: GOLD,
                display: "flex",
              }}
            >
              Reception
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "Cormorant Garamond",
                fontStyle: "italic",
                fontSize: 38,
                color: CREAM,
                display: "flex",
              }}
            >
              Wed, Feb 10, 2027
            </div>
            <div
              style={{
                marginTop: 2,
                fontFamily: "Cormorant Garamond",
                fontSize: 30,
                color: CREAM,
                display: "flex",
              }}
            >
              7 PM onwards
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 110,
              backgroundColor: "rgba(232,185,96,0.55)",
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 400,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: GOLD,
                display: "flex",
              }}
            >
              Muhurtha
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "Cormorant Garamond",
                fontStyle: "italic",
                fontSize: 38,
                color: CREAM,
                display: "flex",
              }}
            >
              Thu, Feb 11, 2027
            </div>
            <div
              style={{
                marginTop: 2,
                fontFamily: "Cormorant Garamond",
                fontSize: 30,
                color: CREAM,
                display: "flex",
              }}
            >
              11:30 AM
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: GOLD,
            display: "flex",
          }}
        >
          NS Convention Hall · Doddaballapur
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: corm400,
          weight: 400,
          style: "normal",
        },
        {
          name: "Cormorant Garamond",
          data: corm600,
          weight: 600,
          style: "normal",
        },
        {
          name: "Cormorant Garamond",
          data: cormItalic,
          weight: 400,
          style: "italic",
        },
        { name: "Inter", data: inter500, weight: 500, style: "normal" },
      ],
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
