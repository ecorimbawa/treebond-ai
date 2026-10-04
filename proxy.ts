import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Sponsoring itself stays wallet-first with no login step (PRD §8) — only the
// dashboard is gated, because it reports on an *account's* linked wallets
// rather than whichever wallet happens to be connected. Signing in with that
// wallet claims anything it already sponsored.
const ROLE_BY_PREFIX: Record<string, string> = {
  "/operator": "operator",
  "/verifier": "verifier",
  "/admin": "admin",
};

// Any signed-in role may open their own sponsor portfolio; an operator who
// also sponsors trees shouldn't be bounced out of it.
const SESSION_ONLY_PREFIXES = ["/dashboard"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const prefix = Object.keys(ROLE_BY_PREFIX).find((p) =>
    pathname.startsWith(p),
  );
  const sessionOnly = SESSION_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (!prefix && !sessionOnly) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (prefix && session.user.role !== ROLE_BY_PREFIX[prefix]) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/operator/:path*",
    "/verifier/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
