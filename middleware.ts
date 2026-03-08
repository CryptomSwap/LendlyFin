import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/search", "/help", "/signin", "/onboarding", "/listing"];
const AUTH_API = "/api/auth";

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith(AUTH_API)) return true;
  if (pathname === "/" || pathname === "/signin" || pathname === "/onboarding" || pathname === "/search" || pathname === "/help") return true;
  if (pathname.startsWith("/listing") && !pathname.includes("/manage")) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/add") || pathname.startsWith("/bookings") || pathname.startsWith("/profile")) return true;
  if (pathname.startsWith("/checkout")) return true;
  if (pathname.includes("/manage")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (process.env.DEV_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.next();
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|api/).*)"],
};
