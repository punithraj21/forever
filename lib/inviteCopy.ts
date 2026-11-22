// Text for the share-ready invitation page (/invite, /kn/invite, /en/invite).
// Kept separate from lib/i18n.ts (the countdown home page) so the two pages
// can be worded independently. Same shape for both languages via `satisfies`.

import type { Lang } from "./i18n";

type EventCopy = {
  id: "reception" | "wedding";
  emoji: string;
  eyebrow: string;
  title: string;
  date: string;
  time: string;
};

type InviteCopy = {
  htmlLang: string;
  switchTo: { label: string; href: string };
  eyebrow: string;
  first: string;
  second: string;
  invitation: string;
  events: [EventCopy, EventCopy]; // chronological: reception, then wedding
  labels: { date: string; time: string; venue: string };
  venueName: string;
  venueTown: string;
  venueSection: {
    eyebrow: string;
    heading: string;
    directions: string;
    banner: string;
  };
  calendar: { google: string; other: string };
  share: {
    heading: string;
    note: string;
    whatsapp: string;
    copy: string;
    copied: string;
    native: string;
    message: string; // WhatsApp / share-sheet text; the page URL is appended
  };
  footer: string;
};

export const INVITE_COPY = {
  en: {
    htmlLang: "en",
    switchTo: { label: "ಕನ್ನಡದಲ್ಲಿ ಓದಿ", href: "/kn/invite" },
    eyebrow: "With joy, we invite you",
    first: "Punith",
    second: "Pallavi",
    invitation:
      "We warmly invite you and your family to celebrate our wedding and bless us with your presence.",
    events: [
      {
        id: "reception",
        emoji: "✦",
        eyebrow: "The evening before",
        title: "Reception",
        date: "Wednesday, February 10, 2027",
        time: "7:00 PM onwards",
      },
      {
        id: "wedding",
        emoji: "❀",
        eyebrow: "The wedding",
        title: "The Muhurtha",
        date: "Thursday, February 11, 2027",
        time: "11:30 AM",
      },
    ],
    labels: { date: "Date", time: "Time", venue: "Venue" },
    venueName: "NS Convention Hall",
    venueTown: "Doddaballapur",
    venueSection: {
      eyebrow: "Both celebrations at",
      heading: "The Venue",
      directions: "Get directions",
      banner: "/venues/wedding-gold.svg",
    },
    calendar: { google: "Google Calendar", other: "Apple / Outlook" },
    share: {
      heading: "Share the invitation",
      note: "Send this page to family and friends.",
      whatsapp: "Share on WhatsApp",
      copy: "Copy link",
      copied: "Link copied!",
      native: "Share",
      message:
        "You're invited to Punith & Pallavi's wedding 💐\nReception: Wed, Feb 10, 2027 · 7 PM onwards\nMuhurtha: Thu, Feb 11, 2027 · 11:30 AM\nNS Convention Hall, Doddaballapur",
    },
    footer: "With love, Punith & Pallavi",
  },
  kn: {
    htmlLang: "kn",
    switchTo: { label: "Read in English", href: "/en/invite" },
    eyebrow: "ಸಂತೋಷದಿಂದ ಆಹ್ವಾನಿಸುತ್ತೇವೆ",
    first: "ಪುನೀತ್",
    second: "ಪಲ್ಲವಿ",
    invitation: "ತಾವು ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ ವಧೂವರರನ್ನು ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ವಿನಂತಿ.",
    events: [
      {
        id: "reception",
        emoji: "✦",
        eyebrow: "ಮದುವೆಯ ಹಿಂದಿನ ಸಂಜೆ",
        title: "ಆರತಕ್ಷತೆ",
        date: "ಬುಧವಾರ, ಫೆಬ್ರವರಿ 10, 2027",
        time: "ಸಂಜೆ 7 ಗಂಟೆಯಿಂದ",
      },
      {
        id: "wedding",
        emoji: "❀",
        eyebrow: "ಶುಭ ವಿವಾಹ",
        title: "ಮುಹೂರ್ತ",
        date: "ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027",
        time: "ಬೆಳಿಗ್ಗೆ 11:30",
      },
    ],
    labels: { date: "ದಿನಾಂಕ", time: "ಸಮಯ", venue: "ಸ್ಥಳ" },
    venueName: "ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್",
    venueTown: "ದೊಡ್ಡಬಳ್ಳಾಪುರ",
    venueSection: {
      eyebrow: "ಎರಡೂ ಸಮಾರಂಭಗಳು ಇಲ್ಲಿ",
      heading: "ಸ್ಥಳ",
      directions: "ದಾರಿ ತೋರಿಸಿ",
      banner: "/venues/wedding-gold-kn.svg",
    },
    calendar: { google: "Google ಕ್ಯಾಲೆಂಡರ್", other: "Apple / Outlook" },
    share: {
      heading: "ಆಹ್ವಾನವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
      note: "ಈ ಪುಟವನ್ನು ಬಂಧು-ಮಿತ್ರರಿಗೆ ಕಳುಹಿಸಿ.",
      whatsapp: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
      copy: "ಲಿಂಕ್ ನಕಲಿಸಿ",
      copied: "ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!",
      native: "ಹಂಚಿಕೊಳ್ಳಿ",
      message:
        "ಪುನೀತ್ & ಪಲ್ಲವಿ ಅವರ ವಿವಾಹಕ್ಕೆ ತಮಗೆ ಆತ್ಮೀಯ ಆಹ್ವಾನ 💐\nಆರತಕ್ಷತೆ: ಬುಧವಾರ, ಫೆಬ್ರವರಿ 10, 2027 · ಸಂಜೆ 7 ಗಂಟೆಯಿಂದ\nಮುಹೂರ್ತ: ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027 · ಬೆಳಿಗ್ಗೆ 11:30\nಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್, ದೊಡ್ಡಬಳ್ಳಾಪುರ",
    },
    footer: "ಪ್ರೀತಿಯಿಂದ, ಪುನೀತ್ & ಪಲ್ಲವಿ",
  },
} satisfies Record<Lang, InviteCopy>;
