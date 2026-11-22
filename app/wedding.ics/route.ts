// Calendar invite for the wedding (muhurtha), served at /wedding.ics.
// Event data lives in lib/calendar.ts (shared with /reception.ics and the
// Google Calendar links).

import { WEDDING, icsResponse } from "@/lib/calendar";

export function GET() {
  return icsResponse(WEDDING);
}
