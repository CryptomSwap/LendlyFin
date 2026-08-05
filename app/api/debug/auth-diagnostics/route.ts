import { NextResponse } from "next/server";

function trimmed(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host") ?? "";
  const nextAuthUrl = trimmed("NEXTAUTH_URL");
  const nextAuthSecret = trimmed("NEXTAUTH_SECRET");
  const googleClientId = trimmed("GOOGLE_CLIENT_ID");
  const googleClientSecret = trimmed("GOOGLE_CLIENT_SECRET");

  return NextResponse.json(
    {
      ok: true,
      env: process.env.NODE_ENV ?? null,
      requestHost: host,
      requestOrigin: url.origin,
      nextAuthUrlConfigured: nextAuthUrl.length > 0,
      nextAuthUrl,
      nextAuthSecretConfigured: nextAuthSecret.length > 0,
      nextAuthSecretLength: nextAuthSecret.length,
      googleClientIdConfigured: googleClientId.length > 0,
      googleClientIdPrefix: googleClientId.slice(0, 12),
      googleClientSecretConfigured: googleClientSecret.length > 0,
      googleClientSecretLength: googleClientSecret.length,
      devAuthBypass: trimmed("DEV_AUTH_BYPASS") || "(unset)",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
