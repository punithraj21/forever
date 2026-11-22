import type { Metadata } from "next";
import WeddingHome from "@/components/WeddingHome";

// Kannada version of the wedding home page. Same layout as `/` (shared
// <WeddingHome>), all copy from lib/i18n.ts → COPY.kn.
//
// The link-preview image stays the English /og/wedding card: next/og (Satori)
// doesn't shape Kannada conjuncts correctly, so a Kannada card would render
// broken letters. Title/description below are in Kannada.

const OG_IMAGE_PATH = "/og/wedding?v=2";
const SHARE_TITLE = "ಪುನೀತ್ & ಪಲ್ಲವಿ · ಶುಭ ವಿವಾಹ";
const SHARE_DESCRIPTION =
  "ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027 · ಬೆಳಿಗ್ಗೆ 11:30 · ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್, ದೊಡ್ಡಬಳ್ಳಾಪುರ";

export const metadata: Metadata = {
  title: "ಪುನೀತ್ & ಪಲ್ಲವಿ · ಕ್ಷಣಗಣನೆ",
  description: "ಮದುವೆಯ ದಿನದತ್ತ ಕ್ಷಣಗಣನೆ.",
  alternates: { languages: { en: "/" } },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    type: "website",
    locale: "kn_IN",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "ಪುನೀತ್ & ಪಲ್ಲವಿ — ಶುಭ ವಿವಾಹ, ಫೆಬ್ರವರಿ 11, 2027",
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

export default function KannadaHome() {
  return <WeddingHome lang="kn" />;
}
