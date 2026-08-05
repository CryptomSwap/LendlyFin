import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { validateRuntimeEnv } from "@/lib/env";

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/add") || pathname.startsWith("/bookings") || pathname.startsWith("/profile")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/owner")) return true;
  if (pathname.startsWith("/checkout")) return true;
  if (pathname.includes("/manage")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  validateRuntimeEnv();
  const { pathname } = request.nextUrl;
  const requestHost = (request.headers.get("host") ?? "").toLowerCase();

  if (process.env.NODE_ENV === "production") {
    const configuredUrl = process.env.NEXTAUTH_URL?.trim();
    if (configuredUrl) {
      try {
        const canonical = new URL(configuredUrl);
        const canonicalHost = canonical.host.toLowerCase();
        // Keep auth/cookies on a single host (prevents OAuth state/session mismatches on www vs apex).
        const equivalentHost =
          requestHost === canonicalHost ||
          requestHost === `www.${canonicalHost}` ||
          (canonicalHost.startsWith("www.") && requestHost === canonicalHost.slice(4));
        if (requestHost && equivalentHost && requestHost !== canonicalHost) {
          const redirectUrl = new URL(request.url);
          redirectUrl.protocol = canonical.protocol;
          redirectUrl.host = canonicalHost;
          return NextResponse.redirect(redirectUrl);
        }
      } catch {
        // Ignore malformed NEXTAUTH_URL; env validation already protects required presence.
      }
    }
  }

  // Never expose uploaded files from the public folder in production (use S3 + API proxy).
  if (process.env.NODE_ENV === "production") {
    if (pathname.startsWith("/uploads/kyc/") || pathname.startsWith("/uploads/listings/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (process.env.DEV_AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server auth misconfigured" },
      { status: 500 }
    );
  }

  const token = await getToken({ req: request, secret });
  if (!token) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const onboardingComplete = token.onboardingComplete === true;
  if (!onboardingComplete && pathname !== "/onboarding") {
    const onboardingUrl = new URL("/onboarding", request.url);
    onboardingUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
