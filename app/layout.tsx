import type { Metadata } from "next";
import "./globals.css";

// Resolve relative URLs (og:image, etc.) against this base. Vercel sets
// VERCEL_URL automatically; set NEXT_PUBLIC_SITE_URL for a custom domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
