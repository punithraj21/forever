import { NextResponse, type NextRequest } from "next/server";

// Host-based defaults (rewrites, so the address bar is unchanged):
// - wedding.devshark.site defaults to Kannada: "/" serves /kn and "/invite"
//   serves /kn/invite. English lives at /en and /en/invite there.
// - pallavipunith.site (+ www) opens the invitation: "/" serves /invite.
//   The countdown home is still reachable there at /en (and /kn).
// forever.devshark.site and every other host are untouched.
const KANNADA_DEFAULT_HOSTS = new Set(["wedding.devshark.site"]);
const INVITE_DEFAULT_HOSTS = new Set([
  "pallavipunith.site",
  "www.pallavipunith.site",
]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;
  if (KANNADA_DEFAULT_HOSTS.has(host)) {
    const target = pathname === "/" ? "/kn" : `/kn${pathname}`;
    return NextResponse.rewrite(new URL(target, request.url));
  }
  if (INVITE_DEFAULT_HOSTS.has(host) && pathname === "/") {
    return NextResponse.rewrite(new URL("/invite", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/invite"] };
