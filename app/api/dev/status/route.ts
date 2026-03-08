import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin";

/**
 * Dev-only: returns whether impersonation is available and current user.
 * Only when DEV_AUTH_BYPASS=true.
 */
export async function GET() {
  if (process.env.DEV_AUTH_BYPASS !== "true") {
    return NextResponse.json({ impersonationAvailable: false }, { status: 404 });
  }

  const user = await getCurrentUser();
  return NextResponse.json(
    {
      impersonationAvailable: true,
      currentUser: user ? { id: user.id, name: user.name ?? user.id } : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
