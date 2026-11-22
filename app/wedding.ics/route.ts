// Downloadable calendar invite for the wedding, served at /wedding.ics.
// Used by the "Add to calendar" button on the home page's Event Details card
// (Apple Calendar / Outlook / Android all open .ics; Google has its own link).
//
// 11:30 AM IST = 06:00 UTC. The end time (3 hours later) is an assumption —
// change WEDDING_END if the real schedule differs.

const WEDDING_START = "20270211T060000Z";
const WEDDING_END = "20270211T090000Z";
const MAPS_URL = "https://maps.app.goo.gl/DEe8rXU4ch4fGqxf7";

export function GET() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Punith & Pallavi//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:punith-pallavi-wedding-20270211@forever",
    "DTSTAMP:20261122T000000Z",
    `DTSTART:${WEDDING_START}`,
    `DTEND:${WEDDING_END}`,
    "SUMMARY:Punith & Pallavi — Wedding",
    "LOCATION:NS Convention Hall\\, Doddaballapur",
    `DESCRIPTION:Muhurtha at 11:30 AM. Directions: ${MAPS_URL}`,
    `URL:${MAPS_URL}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Punith & Pallavi's wedding is tomorrow",
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="punith-pallavi-wedding.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
