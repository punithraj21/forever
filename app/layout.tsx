import type { Metadata } from "next";
import "./globals.css";

// Resolve relative URLs (og:image, etc.) against this base. Prefer an
// explicit custom-domain URL via NEXT_PUBLIC_SITE_URL; fall back to Vercel's
// canonical production URL, then the per-deployment URL, then localhost.
// VERCEL_URL changes on every deploy and Vercel deployment protection blocks
// social scrapers on it — set NEXT_PUBLIC_SITE_URL=https://your-domain on
// the Vercel project so link previews work.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Our Countdown",
  description: "Counting down to the engagement and the wedding day.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
