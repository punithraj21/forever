import type { Metadata } from "next";
import InvitePage from "@/components/InvitePage";

// Share-ready invitation (English). Kannada at /kn/invite; on
// wedding.devshark.site /invite opens in Kannada (proxy.ts).
// Preview card: static public/og-invite-en.jpg (source: app/og/card/en, see that file for how to export).

const OG_IMAGE = "/og-invite-en.jpg";
const TITLE = "Punith & Pallavi · Wedding Invitation";
const DESCRIPTION =
  "Reception: Wed, Feb 10, 2027 · 7 PM onwards. Muhurtha: Thu, Feb 11, 2027 · 11:30 AM. NS Convention Hall, Doddaballapur.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { languages: { kn: "/kn/invite" } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "We are inviting you — Punith & Pallavi: reception Feb 10, muhurtha Feb 11, 2027",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function Invite() {
  return <InvitePage lang="en" />;
}
