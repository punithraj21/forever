import type { Metadata } from "next";
import Invite3 from "@/components/Invite3";

// /invite3 — the interactive book-style invitation
// (components/Invite3.tsx). /invite and /invite2 are untouched.

const OG_IMAGE = "/og-invite-en.jpg";
const TITLE = "Punith & Pallavi · Wedding Invitation";
const DESCRIPTION =
  "Reception: Wed, Feb 10, 2027 · 7 PM onwards. Muhurtha: Thu, Feb 11, 2027 · 11:30 AM. NS Convention Hall, Doddaballapur.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { languages: { kn: "/kn/invite3" } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "We are inviting you — Punith & Pallavi",
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

export default function Invite3En() {
  return <Invite3 lang="en" />;
}
