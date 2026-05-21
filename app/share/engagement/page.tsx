import type { Metadata } from "next";
import EngagementShareClient from "./EngagementShareClient";

// Bump in lockstep with the IMAGE_URL ?v= on the client when the OG design changes,
// so WhatsApp / Twitter / LinkedIn re-scrape a fresh preview.
const OG_IMAGE_PATH = "/share/engagement/og?v=2";

export const metadata: Metadata = {
  title: "Punith & Pallavi · Engagement · Save the Date",
  description:
    "Sunday, June 21, 2026 at Manjunath Grand. Scan to find the venue.",
  openGraph: {
    title: "Punith & Pallavi · Engagement",
    description:
      "Sunday, June 21, 2026 at Manjunath Grand. Scan to find the venue.",
    type: "website",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1080,
        height: 1350,
        alt: "Punith & Pallavi — engagement save-the-date card",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Punith & Pallavi · Engagement",
    description: "Sunday, June 21, 2026 at Manjunath Grand.",
    images: [OG_IMAGE_PATH],
  },
};

export default function Page() {
  return <EngagementShareClient />;
}
