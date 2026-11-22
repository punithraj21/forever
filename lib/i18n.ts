// Text for the wedding home page in English (`/`) and Kannada (`/kn`).
// Components take a `lang` prop (default "en", so /legacy and other routes are
// untouched) and read their copy from here. Keep the two objects in the same
// shape — TypeScript enforces it via `satisfies Record<Lang, Copy>`.

export type Lang = "en" | "kn";

type Copy = {
  htmlLang: string;
  locale: string; // for toLocaleDateString
  switchTo: { label: string; href: string };
  header: {
    eyebrow: string;
    first: string;
    second: string;
    tagline: string;
  };
  countdown: {
    title: string;
    subtitle: string;
    passedVerb: string; // pill text once the date passes
    passedFor: string; // line above the count-up digits
    andCounting: string;
    units: {
      days: [string, string];
      hours: [string, string];
      minutes: [string, string];
      seconds: [string, string];
    }; // [full, short-for-phones]
    monthsLeft: (months: number, days: number) => string;
  };
  details: {
    eyebrow: string;
    heading: string;
    cardEyebrow: string;
    cardTitle: string;
    date: string;
    time: string;
    venue: string;
    labels: { date: string; time: string; venue: string };
    viewMap: string;
    googleCal: string;
    otherCal: string;
    banner: string; // venue banner image
  };
  map: {
    eyebrow: string;
    heading: string;
    cardEyebrow: string;
    venue: string;
    directions: string;
  };
  quote: { text: string; by: string };
  footer: string;
};

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export const COPY = {
  en: {
    htmlLang: "en",
    locale: "en-US",
    switchTo: { label: "ಕನ್ನಡದಲ್ಲಿ ಓದಿ", href: "/kn" },
    header: {
      eyebrow: "With love",
      first: "Punith",
      second: "Pallavi",
      tagline: "Counting down to forever",
    },
    countdown: {
      title: "The Muhurtha",
      subtitle: "The Forever",
      passedVerb: "Married",
      passedFor: "Married for",
      andCounting: "and counting…",
      units: {
        days: ["Days", "Days"],
        hours: ["Hours", "Hours"],
        minutes: ["Minutes", "Mins"],
        seconds: ["Seconds", "Secs"],
      },
      monthsLeft: (m, d) =>
        [
          m > 0 ? plural(m, "month", "months") : null,
          d > 0 || m === 0 ? plural(d, "day", "days") : null,
        ]
          .filter(Boolean)
          .join(", ") + " left",
    },
    details: {
      eyebrow: "Save the date",
      heading: "Event Details",
      cardEyebrow: "The Forever",
      cardTitle: "The Muhurtha",
      date: "Thursday, February 11, 2027",
      time: "11:30 AM",
      venue: "NS Convention Hall",
      labels: { date: "Date", time: "Time", venue: "Venue" },
      viewMap: "View map",
      googleCal: "Google Calendar",
      otherCal: "Apple / Outlook",
      banner: "/venues/wedding-gold.svg",
    },
    map: {
      eyebrow: "Find your way",
      heading: "On the Map",
      cardEyebrow: "The Muhurtha",
      venue: "NS Convention Hall",
      directions: "Get directions",
    },
    quote: {
      text: "Compromise, communicate, and never go to bed angry - the three pieces of advice to our happy life.",
      by: "Punith Raj",
    },
    footer: "Every second brings us closer, Punith & Pallavi.",
  },
  kn: {
    htmlLang: "kn",
    locale: "kn-IN",
    switchTo: { label: "Read in English", href: "/" },
    header: {
      eyebrow: "ಪ್ರೀತಿಯಿಂದ",
      first: "ಪುನೀತ್",
      second: "ಪಲ್ಲವಿ",
      tagline: "ಶಾಶ್ವತ ಬಂಧನದತ್ತ ಕ್ಷಣಗಣನೆ",
    },
    countdown: {
      title: "ಶುಭ ಮುಹೂರ್ತ",
      subtitle: "ಶುಭ ವಿವಾಹ",
      passedVerb: "ವಿವಾಹಿತರು",
      passedFor: "ಮದುವೆಯಾಗಿ",
      andCounting: "…ಎಣಿಕೆ ಮುಂದುವರಿದಿದೆ",
      units: {
        days: ["ದಿನ", "ದಿನ"],
        hours: ["ಗಂಟೆ", "ಗಂಟೆ"],
        minutes: ["ನಿಮಿಷ", "ನಿಮಿಷ"],
        seconds: ["ಸೆಕೆಂಡು", "ಸೆಕೆಂಡು"],
      },
      monthsLeft: (m, d) =>
        [m > 0 ? `${m} ತಿಂಗಳು` : null, d > 0 || m === 0 ? `${d} ದಿನ` : null]
          .filter(Boolean)
          .join(", ") + " ಬಾಕಿ",
    },
    details: {
      eyebrow: "ದಿನಾಂಕ ನೆನಪಿರಲಿ",
      heading: "ಸಮಾರಂಭದ ವಿವರಗಳು",
      cardEyebrow: "ಶುಭ ವಿವಾಹ",
      cardTitle: "ಶುಭ ಮುಹೂರ್ತ",
      date: "ಗುರುವಾರ, ಫೆಬ್ರವರಿ 11, 2027",
      time: "ಬೆಳಿಗ್ಗೆ 11:30",
      venue: "ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್",
      labels: { date: "ದಿನಾಂಕ", time: "ಸಮಯ", venue: "ಸ್ಥಳ" },
      viewMap: "ನಕ್ಷೆ ನೋಡಿ",
      googleCal: "Google ಕ್ಯಾಲೆಂಡರ್",
      otherCal: "Apple / Outlook",
      banner: "/venues/wedding-gold-kn.svg",
    },
    map: {
      eyebrow: "ದಾರಿ ಹುಡುಕಿ",
      heading: "ನಕ್ಷೆಯಲ್ಲಿ",
      cardEyebrow: "ಶುಭ ಮುಹೂರ್ತ",
      venue: "ಎನ್.ಎಸ್. ಕನ್ವೆನ್ಷನ್ ಹಾಲ್",
      directions: "ದಾರಿ ತೋರಿಸಿ",
    },
    quote: {
      text: "ಹೊಂದಾಣಿಕೆ, ಮಾತುಕತೆ, ಮತ್ತು ಎಂದಿಗೂ ಕೋಪದಲ್ಲಿ ಮಲಗದಿರುವುದು — ನಮ್ಮ ಸುಖ ಜೀವನಕ್ಕೆ ಮೂರು ಸೂತ್ರಗಳು.",
      by: "ಪುನೀತ್ ರಾಜ್",
    },
    footer: "ಪ್ರತಿ ಕ್ಷಣವೂ ನಮ್ಮನ್ನು ಇನ್ನಷ್ಟು ಹತ್ತಿರ ತರುತ್ತಿದೆ — ಪುನೀತ್ & ಪಲ್ಲವಿ.",
  },
} satisfies Record<Lang, Copy>;
