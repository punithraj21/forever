import { NextResponse, type NextRequest } from "next/server";

// wedding.devshark.site defaults to Kannada: its "/" serves the /kn page
// (a rewrite, so the address bar stays "/"). English lives at /en there.
// forever.devshark.site and every other host are untouched.
const KANNADA_DEFAULT_HOSTS = new Set(["wedding.devshark.site"]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (KANNADA_DEFAULT_HOSTS.has(host)) {
    return NextResponse.rewrite(new URL("/kn", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };
