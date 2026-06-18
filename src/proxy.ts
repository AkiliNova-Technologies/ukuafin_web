import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SaccoJWTPayload, verifyToken } from "@/lib/auth/jwt";

// Configuration boundary definitions mapping directly to your Route Groups structures
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];
const PLATFORM_PREFIX = "/platform/dashboard"; 
const TENANT_PREFIX = "/tenant/dashboard";
const MEMBER_PREFIX = "/member/dashboard";
const CHECKOUT_PREFIX = "/checkout";

/**
 * Next.js Edge Gateway Proxy Engine
 * Handles structural path shielding, multi-tenant layer context injection, and state bounces.
 */
export async function proxy(request: NextRequest) { 
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;
  
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Fetch the access token cookie value securely from edge runtime memory request headers
  const tokenCookie = request.cookies.get("sacco_access_token");
  const token = tokenCookie?.value;

  // Handle public marketing and base pathing flows early
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isMarketingRoute = 
    pathname === "/" || 
    ["/about", "/contact", "/demo", "/features", "/pricing"].some((route) => pathname.startsWith(route));

  let session: SaccoJWTPayload | null = null;
  if (token) {
    session = await verifyToken(token);
  }

  // Handle Redirection logic blocks if authentication state flags conflict
  if (isAuthRoute) {
    if (session) {
      if (session.platformRole) return NextResponse.redirect(new URL(PLATFORM_PREFIX, origin));
      if (session.saccoRole === "MEMBER") return NextResponse.redirect(new URL(MEMBER_PREFIX, origin));
      return NextResponse.redirect(new URL(TENANT_PREFIX, origin));
    }
    return NextResponse.next();
  }

  const isProtectedArea = 
    pathname.startsWith(PLATFORM_PREFIX) || 
    pathname.startsWith(TENANT_PREFIX) || 
    pathname.startsWith(MEMBER_PREFIX) ||
    pathname.startsWith(CHECKOUT_PREFIX) ||
    pathname.startsWith("/api");

  if (isProtectedArea && !session && !isMarketingRoute) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication session context expired or missing." }, { status: 401 });
    }
    
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce Sub-System URL Access Isolation rules
  if (session) {
    if (pathname.startsWith(PLATFORM_PREFIX) && !session.platformRole) {
      return handleUnauthorizedRedirect(request, session, origin);
    }

    if (pathname.startsWith(TENANT_PREFIX) && session.saccoRole === "MEMBER") {
      return NextResponse.redirect(new URL(MEMBER_PREFIX, origin));
    }

    if (pathname.startsWith(MEMBER_PREFIX) && session.saccoRole && session.saccoRole !== "MEMBER" && session.saccoRole !== "OWNER") {
      return NextResponse.redirect(new URL(TENANT_PREFIX, origin));
    }
  }

  // Multi-Tenant Injection Strategy: Pass context cleanly to backend API nodes via structural Request Headers
  const modifiedHeaders = new Headers(request.headers);
  if (session) {
    modifiedHeaders.set("x-sacco-user-id", session.userId);
    modifiedHeaders.set("x-sacco-email", session.email);
    if (session.organizationId) modifiedHeaders.set("x-sacco-org-id", session.organizationId);
    if (session.branchId) modifiedHeaders.set("x-sacco-branch-id", session.branchId);
    if (session.saccoRole) modifiedHeaders.set("x-sacco-role", session.saccoRole);
    if (session.platformRole) modifiedHeaders.set("x-sacco-platform-role", session.platformRole);
  }

  return NextResponse.next({
    request: {
      headers: modifiedHeaders,
    },
  });
}

function handleUnauthorizedRedirect(request: NextRequest, session: SaccoJWTPayload, origin: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Access Forbidden: Security context mismatch." }, { status: 403 });
  }
  if (session.saccoRole === "MEMBER") return NextResponse.redirect(new URL(MEMBER_PREFIX, origin));
  return NextResponse.redirect(new URL(TENANT_PREFIX, origin));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};