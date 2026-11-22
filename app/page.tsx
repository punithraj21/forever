import type { Metadata } from "next";
import WeddingHome from "@/components/WeddingHome";

// The wedding is the main event now, so the home page is wedding-only (the full
// original layout lives at /legacy). The body is <WeddingHome>, shared with the
// Kannada version at /kn.
//
// Page metadata merges over the root layout's, so this overrides only the
// description (which used to mention the engagement) for `/` — every other
// route keeps the layout default.
// Link preview (WhatsApp etc.) — image rendered by app/og/wedding/route.tsx.
// Bump ?v= when that design changes so WhatsApp re-scrapes a fresh card.
// Static PNG (rendered from app/og/wedding/route.tsx and saved to public/):
// generating it per request exceeds the Workers CPU limit (error 1102).
// To change the card: edit the route, open /og/wedding locally, save the PNG
// over public/og-wedding.png, and bump ?v=.
const OG_IMAGE_PATH = "/og-wedding.png?v=3";
const SHARE_TITLE = "Punith & Pallavi · Wedding";
const SHARE_DESCRIPTION =
  "Thursday, February 11, 2027 · 11:30 AM at NS Convention Hall, Doddaballapur.";

export const metadata: Metadata = {
  description: "Counting down to the wedding day.",
  alternates: { languages: { kn: "/kn" } },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    type: "website",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Punith & Pallavi — wedding, February 11, 2027 at NS Convention Hall",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default function Home() {
  return <WeddingHome lang="en" />;
}
