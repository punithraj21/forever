// Calendar invite for the reception, served at /reception.ics.
// Event data lives in lib/calendar.ts.

import { RECEPTION, icsResponse } from "@/lib/calendar";

export function GET() {
  return icsResponse(RECEPTION);
}
