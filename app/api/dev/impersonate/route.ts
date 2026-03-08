import { NextResponse } from "next/server";
import { isAllowedDevImpersonationId } from "@/lib/auth/dev-impersonation";

const COOKIE_NAME = "dev_impersonate_id";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Dev-only: set impersonation cookie to switch current user.
 * Only when DEV_AUTH_BYPASS=true. Body: { userId: string }.
 */
export async function POST(req: Request) {
  if (process.env.DEV_AUTH_BYPASS !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  let body: { userId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const clearCookie = userId === "" || body.userId === null;

  if (!clearCookie && !isAllowedDevImpersonationId(userId)) {
    return NextResponse.json(
      { error: "Invalid or disallowed userId" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({
    ok: true,
    userId: clearCookie ? null : userId,
  });
  if (clearCookie) {
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  } else {
    res.cookies.set(COOKIE_NAME, userId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: MAX_AGE,
      secure: false,
    });
  }
  return res;
}
