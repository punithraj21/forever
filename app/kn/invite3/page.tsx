import type { Metadata } from "next";
import Invite3 from "@/components/Invite3";

// /invite3 (Kannada: /kn/invite3) — the interactive book-style invitation
// (components/Invite3.tsx). /invite and /invite2 are untouched.

const OG_IMAGE = "/og-invite-kn.jpg";
const TITLE = "ಪುನೀತ್ & ಪಲ್ಲವಿ · ವಿವಾಹ ಆಹ್ವಾನ";
const DESCRIPTION =
  "ಆರತಕ್ಷತೆ: ಬುಧವಾರ, ಫೆಬ್ರವರಿ 10, 2027 · ಸಂಜೆ 7 ಗಂಟೆಯಿಂದ. ಮುಹೂರ್ತ: ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027 · ಬೆಳಿಗ್ಗೆ 11:30. ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್, ದೊಡ್ಡಬಳ್ಳಾಪುರ.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { languages: { en: "/invite3" } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "kn_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "ಪುನೀತ್ & ಪಲ್ಲವಿ — ವಿವಾಹ ಆಹ್ವಾನ",
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

export default function Invite3Kn() {
  return <Invite3 lang="kn" />;
}
