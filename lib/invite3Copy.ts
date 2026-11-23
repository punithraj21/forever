// Extra text for /invite3 and /kn/invite3 (the interactive book-style
// invitation). Names, dates, venue and the share message come from
// lib/inviteCopy.ts; this file only holds what that page adds.
// The Kannada lines are machine-written — Punith should proofread them.

import type { Lang } from "./i18n";

export type Invite3Copy = {
  loading: string;
  tapToOpen: string;
  together: string;
  scrollHint: string;
  saveTheDate: string;
  pullHint: string;
  addToCalendar: string;
  units: { d: string; h: string; m: string; s: string };
  festivities: string;
  swipeHint: string;
  receptionNote: string;
  muhurthaNote: string;
  story: string;
  captions: [string, string];
  location: string;
  tapForMap: string;
  copyAddress: string;
  addressCopied: string;
  closing: string;
  closingFrom: string;
};

export const INVITE3_COPY = {
  en: {
    loading: "Preparing your invitation…",
    tapToOpen: "Tap the book to open",
    together: "Together with their families",
    scrollHint: "Scroll down",
    saveTheDate: "Save the Date",
    pullHint: "Pull the tassel",
    addToCalendar: "Add to calendar",
    units: { d: "Days", h: "Hrs", m: "Min", s: "Sec" },
    festivities: "Wedding Festivities",
    swipeHint: "Swipe to see both",
    receptionNote: "An evening of blessings and celebration",
    muhurthaNote: "The sacred hour of the wedding",
    story: "Our Story",
    captions: ["Together, always", "Our forever begins"],
    location: "Location",
    tapForMap: "Tap for the map",
    copyAddress: "Copy address",
    addressCopied: "Address copied",
    closing: "We can't wait to celebrate with you",
    closingFrom: "With love, Punith & Pallavi",
  },
  kn: {
    loading: "ಆಹ್ವಾನ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…",
    tapToOpen: "ತೆರೆಯಲು ಪುಸ್ತಕವನ್ನು ಒತ್ತಿ",
    together: "ಕುಟುಂಬಗಳೊಂದಿಗೆ",
    scrollHint: "ಕೆಳಗೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ",
    saveTheDate: "ದಿನಾಂಕ ಗುರುತಿಸಿಕೊಳ್ಳಿ",
    pullHint: "ಗೊಂಡೆಯನ್ನು ಎಳೆಯಿರಿ",
    addToCalendar: "ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
    units: { d: "ದಿನ", h: "ಗಂಟೆ", m: "ನಿಮಿಷ", s: "ಸೆಕೆಂಡ್" },
    festivities: "ವಿವಾಹ ಸಂಭ್ರಮ",
    swipeHint: "ಎರಡನ್ನೂ ನೋಡಲು ಸ್ವೈಪ್ ಮಾಡಿ",
    receptionNote: "ಆಶೀರ್ವಾದ ಮತ್ತು ಸಂಭ್ರಮದ ಸಂಜೆ",
    muhurthaNote: "ವಿವಾಹದ ಪವಿತ್ರ ಘಳಿಗೆ",
    story: "ನಮ್ಮ ಕಥೆ",
    captions: ["ಯಾವಾಗಲೂ ಜೊತೆಯಾಗಿ", "ನಮ್ಮ ಬಾಳು ಇಲ್ಲಿಂದ ಆರಂಭ"],
    location: "ಸ್ಥಳ",
    tapForMap: "ನಕ್ಷೆಗಾಗಿ ಒತ್ತಿ",
    copyAddress: "ವಿಳಾಸ ನಕಲಿಸಿ",
    addressCopied: "ವಿಳಾಸ ನಕಲಿಸಲಾಗಿದೆ",
    closing: "ನಿಮ್ಮೊಂದಿಗೆ ಸಂಭ್ರಮಿಸಲು ಕಾತರರಾಗಿದ್ದೇವೆ",
    closingFrom: "ಪ್ರೀತಿಯಿಂದ, ಪುನೀತ್ & ಪಲ್ಲವಿ",
  },
} satisfies Record<Lang, Invite3Copy>;
