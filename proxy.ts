import { NextResponse } from "next/server";
import { auth } from "@/auth";

// /dashboard (sponsor) is intentionally not gated here — per PRD §8's sponsor
// journey, sponsoring is wallet-first with no login step; that page already
// handles "no wallet connected" itself (see app/(sponsor)/dashboard/page.tsx).
const ROLE_BY_PREFIX: Record<string, string> = {
  "/operator": "operator",
  "/verifier": "verifier",
  "/admin": "admin",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const prefix = Object.keys(ROLE_BY_PREFIX).find((p) =>
    pathname.startsWith(p),
  );
  if (!prefix) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (session.user.role !== ROLE_BY_PREFIX[prefix]) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/operator/:path*", "/verifier/:path*", "/admin/:path*"],
};
