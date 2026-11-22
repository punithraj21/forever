import type { Metadata } from "next";
import InvitePage from "@/components/InvitePage";

// Kannada invitation. The preview image is the English card (next/og can't
// shape Kannada); the title and description are in Kannada.

const OG_IMAGE = "/og-invite.jpg";
const TITLE = "ಪುನೀತ್ & ಪಲ್ಲವಿ · ವಿವಾಹ ಆಹ್ವಾನ";
const DESCRIPTION =
  "ಆರತಕ್ಷತೆ: ಬುಧವಾರ, ಫೆಬ್ರವರಿ 10, 2027 · ಸಂಜೆ 7 ಗಂಟೆಯಿಂದ. ಮುಹೂರ್ತ: ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027 · ಬೆಳಿಗ್ಗೆ 11:30. ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್, ದೊಡ್ಡಬಳ್ಳಾಪುರ.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { languages: { en: "/en/invite" } },
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

export default function KannadaInvite() {
  return <InvitePage lang="kn" />;
}
