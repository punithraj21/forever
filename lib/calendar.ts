// Calendar data for the two celebrations, shared by the .ics routes, the
// Google Calendar links on the home page and the /invite page.
//
// Times are UTC (IST = UTC+5:30). End times are assumptions (3 hours each) —
// change them here if the real schedule differs.

export const VENUE_NAME = "NS Convention Hall";
export const VENUE_TOWN = "Doddaballapur";
export const VENUE_MAPS_URL = "https://maps.app.goo.gl/DEe8rXU4ch4fGqxf7";

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
