// proxy.ts
// Location: project root
//
// Next.js Middleware runs on the Edge Runtime — a lightweight environment
// that does NOT support Node.js APIs like crypto, fs, or Prisma.
//
// This means we cannot import lib/auth.ts here (it uses Prisma).
// Instead we read the session cookie directly using Better Auth's
// edge-compatible helper, which only parses the cookie without
// hitting the database.

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const PROTECTED_ROUTES = ["/appointments", "/profile"];
const ADMIN_ROUTES = ["/admin"];
const DOCTOR_ROUTES = ["/doctor-portal"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // getSessionCookie reads the Better Auth session cookie from the request.
  // This is edge-compatible — it does not use Prisma or Node.js crypto.
  // Returns the session token if present, null if not logged in.
  //
  // NOTE: This only tells us IF the user is logged in, not their role.
  // For role-based checks (admin, doctor) we fetch our session API endpoint
  // which runs in Node.js runtime where Prisma works fine.
  const sessionCookie = await getSessionCookie(request);
  const isLoggedIn = !!sessionCookie;

  // ── Auth routes (/sign-in, /sign-up) ──────────────────────────────────────
  // Redirect already logged-in users away from auth pages
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes (/appointments/*, /profile/*) ────────────────────────
  // Any logged-in user can access these
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // ── Admin routes (/admin/*) ───────────────────────────────────────────────
  // Requires ADMIN role or isRootAdmin — fetch full session to check
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const sessionRes = await fetch(
      new URL("/api/auth/get-session", request.url),
      { headers: request.headers },
    );
    const session = await sessionRes.json();
    const isAdmin =
      session?.user?.role === "ADMIN" || session?.user?.isRootAdmin === true;

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // ── Doctor routes (/doctor-portal/*) ─────────────────────────────────────
  // Requires DOCTOR role — fetch full session to check
  if (matchesRoute(pathname, DOCTOR_ROUTES)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const sessionRes = await fetch(
      new URL("/api/auth/get-session", request.url),
      { headers: request.headers },
    );
    const session = await sessionRes.json();

    if (session?.user?.role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  }

  // ── Public routes ─────────────────────────────────────────────────────────
  return NextResponse.next();
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCHER
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)"],
};
