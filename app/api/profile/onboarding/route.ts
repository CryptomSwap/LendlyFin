import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; phoneNumber?: unknown; city?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!phoneNumber) missing.push("phoneNumber");
  if (!city) missing.push("city");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Missing or invalid required fields", fields: missing },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name, phoneNumber, city },
    });
  } catch (err) {
    console.error("[onboarding PATCH] prisma.user.update failed:", err);

    if (err instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            "Database client failed to initialize. Check DATABASE_URL and SSL settings on the server (see DATABASE_SSL_* in .env.example).",
          prismaCode: "InitializationError",
        },
        { status: 503 }
      );
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "User record not found. Try signing out and back in." },
          { status: 404 }
        );
      }
      if (err.code === "P2021" || err.code === "P2010" || err.code === "P2022") {
        return NextResponse.json(
          {
            error:
              "Database schema is out of date. Run migrations against your production database (e.g. prisma migrate deploy).",
            prismaCode: err.code,
          },
          { status: 503 }
        );
      }
      // Connection / server not reachable (common on serverless + wrong URL or pooler)
      if (
        err.code === "P1001" ||
        err.code === "P1002" ||
        err.code === "P1017"
      ) {
        return NextResponse.json(
          {
            error:
              "Cannot reach the database server. Confirm DATABASE_URL (use the pooled connection string if your host recommends it), region, and that the DB allows connections from Vercel.",
            prismaCode: err.code,
          },
          { status: 503 }
        );
      }
    }

    const message =
      err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();

    const looksLikeTls =
      lower.includes("certificate") ||
      lower.includes("self-signed") ||
      lower.includes("ssl") ||
      lower.includes("tls") ||
      lower.includes("unable to verify the first certificate");

    const looksLikeNetwork =
      lower.includes("connect") ||
      lower.includes("econnrefused") ||
      lower.includes("etimedout") ||
      lower.includes("enotfound") ||
      lower.includes("getaddrinfo") ||
      lower.includes("timeout") ||
      lower.includes("database_url") ||
      lower.includes("password authentication failed") ||
      lower.includes("no pg_hba.conf");

    if (looksLikeTls) {
      return NextResponse.json(
        {
          error:
            "Database TLS/SSL error. If you use Supabase or similar from Vercel, try adding DATABASE_SSL_REJECT_UNAUTHORIZED=false for the pooler URL, or use the provider’s serverless/pooled connection string.",
        },
        { status: 503 }
      );
    }

    if (looksLikeNetwork) {
      return NextResponse.json(
        {
          error:
            "Cannot reach the database. Verify DATABASE_URL on Vercel (Production), DB firewall / allowed IPs, and use the connection string meant for serverless (pooler) if your provider offers one.",
        },
        { status: 503 }
      );
    }

    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        error:
          "Could not save profile. Please try again or contact support.",
        ...(isDev ? { debugMessage: message.slice(0, 500) } : {}),
      },
      { status: 503 }
    );
  }

  await trackEvent({
    eventName: "onboarding_completed",
    userId: user.id,
    payload: { city },
  });

  return NextResponse.json({ ok: true });
}
