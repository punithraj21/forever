import { NextResponse, type NextRequest } from "next/server";

// wedding.devshark.site defaults to Kannada: "/" serves /kn and "/invite"
// serves /kn/invite (rewrites, so the address bar is unchanged). English
// lives at /en and /en/invite there.
// forever.devshark.site and every other host are untouched.
const KANNADA_DEFAULT_HOSTS = new Set(["wedding.devshark.site"]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (KANNADA_DEFAULT_HOSTS.has(host)) {
    const { pathname } = request.nextUrl;
    const target = pathname === "/" ? "/kn" : `/kn${pathname}`;
    return NextResponse.rewrite(new URL(target, request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/invite"] };
