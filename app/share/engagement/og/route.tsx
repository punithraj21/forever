import { ImageResponse } from "next/og";
import QRCode from "qrcode";

export const runtime = "edge";

const VENUE_URL = "https://maps.app.goo.gl/bN6oeNQNvGHJVkiX7";

async function loadGoogleFont(family: string, weight: number) {
  // Use the v1 CSS endpoint with NO User-Agent so Google returns TTF (truetype),
  // which Satori can decode. The v2 endpoint + modern UA serves WOFF2, which
  // the edge-runtime Satori build in this project can't parse.
  const url = `https://fonts.googleapis.com/css?family=${family.replace(
    / /g,
    "+",
  )}:${weight}`;
  const css = await fetch(url).then((r) => r.text());

  const match = css.match(
    /src:\s*url\((https:\/\/[^)]+\.ttf)\)\s*format\('truetype'\)/,
  );
  if (!match)
    throw new Error(`Could not parse TTF URL for ${family} ${weight}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export async function GET() {
  const [cormorant400, cormorant600, inter400, inter500, qrSvg] =
    await Promise.all([
      loadGoogleFont("Cormorant Garamond", 400),
      loadGoogleFont("Cormorant Garamond", 600),
      loadGoogleFont("Inter", 400),
      loadGoogleFont("Inter", 500),
      QRCode.toString(VENUE_URL, {
        type: "svg",
        margin: 0,
        width: 260,
        color: { dark: "#3a2030", light: "#ffffff" },
        errorCorrectionLevel: "M",
      }),
    ]);

  const qrDataUri = `data:image/svg+xml;base64,${btoa(qrSvg)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff8f3",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(255, 220, 230, 0.65), transparent 60%), radial-gradient(ellipse at bottom, rgba(255, 235, 215, 0.6), transparent 60%), linear-gradient(180deg, #fff8f3 0%, #fdeef0 100%)",
          padding: "100px 80px",
          fontFamily: "Inter",
          color: "#3a2030",
        }}
      >
        {/* Top eyebrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontFamily: "Inter",
              fontWeight: 500,
              letterSpacing: 10,
              color: "#a06a7c",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            ✦ With Love ✦
          </div>
        </div>

        {/* Middle block — names, divider, event */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 156,
              fontFamily: "Cormorant Garamond",
              fontWeight: 400,
              color: "#3a2030",
              letterSpacing: -3,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>Punith</span>
            <span
              style={{ color: "#ec99b3", margin: "0 22px", fontWeight: 600 }}
            >
              &
            </span>
            <span>Pallavi</span>
          </div>

          <div
            style={{
              width: 180,
              height: 1,
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, #f4c1ce 50%, transparent 100%)",
              marginTop: 56,
              marginBottom: 56,
            }}
          />

          <div
            style={{
              fontSize: 22,
              fontFamily: "Inter",
              fontWeight: 500,
              letterSpacing: 10,
              color: "#a06a7c",
              textTransform: "uppercase",
              marginBottom: 36,
              display: "flex",
            }}
          >
            The Promise · Engagement
          </div>

          <div
            style={{
              fontSize: 68,
              fontFamily: "Cormorant Garamond",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#5a3a4a",
              lineHeight: 1.15,
              display: "flex",
            }}
          >
            Sunday, June 21, 2026
          </div>

          <div
            style={{
              fontSize: 38,
              fontFamily: "Cormorant Garamond",
              fontWeight: 400,
              color: "#7a5560",
              marginTop: 28,
              display: "flex",
            }}
          >
            at Manjunath Grand
          </div>

          {/* QR — scan for venue */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 14,
                backgroundColor: "#ffffff",
                borderRadius: 16,
                border: "1px solid rgba(180, 80, 110, 0.15)",
                boxShadow:
                  "0 14px 30px -14px rgba(180, 80, 110, 0.35), 0 2px 4px rgba(58, 32, 48, 0.04)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUri} width={150} height={150} alt="" />
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                fontFamily: "Inter",
                fontWeight: 500,
                letterSpacing: 5,
                color: "#9a7080",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Scan for directions
            </div>
          </div>
        </div>

        {/* Bottom mark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 1,
              backgroundColor: "#e5b8c5",
              marginBottom: 20,
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontFamily: "Inter",
              fontWeight: 500,
              letterSpacing: 8,
              color: "#9a7080",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            ❀ Save the date ❀
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorant400,
          weight: 400,
          style: "normal",
        },
        {
          name: "Cormorant Garamond",
          data: cormorant600,
          weight: 600,
          style: "normal",
        },
        { name: "Inter", data: inter400, weight: 400, style: "normal" },
        { name: "Inter", data: inter500, weight: 500, style: "normal" },
      ],
      headers: {
        // Tiny browser cache so design tweaks land on next refresh; CDN keeps
        // a long cache for performance. Bump the ?v= on the page when the
        // design changes to force a fresh CDN entry without waiting.
        "Cache-Control":
          "public, max-age=60, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
