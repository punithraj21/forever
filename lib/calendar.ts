// Calendar data for the two celebrations, shared by the .ics routes, the
// Google Calendar links on the home page and the /invite page.
//
// Times are UTC (IST = UTC+5:30). End times are assumptions (3 hours each) —
// change them here if the real schedule differs.

export const VENUE_NAME = "NS Convention Hall";
export const VENUE_TOWN = "Doddaballapur";
/**
 * Official long-form Google Maps link for a spot. Don't use maps.app.goo.gl
 * short links here: they now hang on desktop and, on Android Chrome, bounce to
 * goo.gl/app/maps → "Dynamic Link Not Found" (Firebase Dynamic Links shut
 * down). This form opens the Maps app on phones and maps in a browser.
 */
export const googleMapsUrl = (lat: number, lon: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}`;

/** NS Convention Hall — same coordinates as the embedded map (VenueMap). */
export const WEDDING_VENUE = { lat: 13.2872715, lon: 77.5738031 };
/** Shri Manjunatha Grand Veg (engagement, /legacy + /share/engagement). */
export const ENGAGEMENT_VENUE = { lat: 13.2802724, lon: 77.5545281 };

// By name rather than coordinates so the pin is labelled with the hall (Google
// lists it as "NS Convention Halls"). Checked: this search lands exactly on
// WEDDING_VENUE. If it ever picks the wrong place, fall back to
// googleMapsUrl(WEDDING_VENUE.lat, WEDDING_VENUE.lon).
export const VENUE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=NS+Convention+Hall%2C+Doddaballapur";
export const ENGAGEMENT_MAPS_URL = googleMapsUrl(
  ENGAGEMENT_VENUE.lat,
  ENGAGEMENT_VENUE.lon,
);

export type CalEvent = {
  uid: string;
  title: string;
  start: string; // yyyymmddThhmmssZ
  end: string;
  details: string;
  alarm: string;
  filename: string;
};

export const RECEPTION: CalEvent = {
  uid: "punith-pallavi-reception-20270210@forever",
  title: "Punith & Pallavi — Reception",
  start: "20270210T133000Z", // 7:00 PM IST
  end: "20270210T163000Z", // 10:00 PM IST (assumed)
  details: `Reception from 7:00 PM. Directions: ${VENUE_MAPS_URL}`,
  alarm: "Punith & Pallavi's reception is tomorrow",
  filename: "punith-pallavi-reception.ics",
};

export const WEDDING: CalEvent = {
  uid: "punith-pallavi-wedding-20270211@forever",
  title: "Punith & Pallavi — Wedding",
  start: "20270211T060000Z", // 11:30 AM IST
  end: "20270211T090000Z", // 2:30 PM IST (assumed)
  details: `Muhurtha at 11:30 AM. Directions: ${VENUE_MAPS_URL}`,
  alarm: "Punith & Pallavi's wedding is tomorrow",
  filename: "punith-pallavi-wedding.ics",
};

export function googleCalUrl(e: CalEvent): string {
  return (
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: e.title,
      dates: `${e.start}/${e.end}`,
      ctz: "Asia/Kolkata",
      location: `${VENUE_NAME}, ${VENUE_TOWN}`,
      details: e.details,
    }).toString()
  );
}

export function icsResponse(e: CalEvent): Response {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Punith & Pallavi//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    "DTSTAMP:20261122T000000Z",
    `DTSTART:${e.start}`,
    `DTEND:${e.end}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${VENUE_NAME}\\, ${VENUE_TOWN}`,
    `DESCRIPTION:${e.details}`,
    `URL:${VENUE_MAPS_URL}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${e.alarm}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
