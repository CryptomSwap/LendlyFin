/**
 * Dev auth adapter: uses DEV_AUTH_BYPASS + DEV_USER_ID + Prisma.
 * When dev impersonation cookie is set, uses that user id instead (dev-only).
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "./types";
import {
  DEV_IMPERSONATE_COOKIE_NAME,
  isAllowedDevImpersonationId,
} from "./dev-impersonation";

function getImpersonateIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${DEV_IMPERSONATE_COOKIE_NAME}=`));
  const value = match?.split("=")[1]?.trim();
  return value && isAllowedDevImpersonationId(value) ? value : null;
}

function toAuthUser(row: {
  id: string;
  name: string;
  isAdmin: boolean;
  kycStatus?: string | null;
  kycRejectedReason?: string | null;
  suspendedAt?: Date | null;
  email?: string | null;
  phoneNumber?: string | null;
  city?: string | null;
}): AuthUser {
  return {
    id: row.id,
    name: row.name ?? null,
    isAdmin: row.isAdmin ?? false,
    kycStatus: row.kycStatus ?? null,
    kycRejectedReason: row.kycRejectedReason ?? null,
    suspendedAt: row.suspendedAt ?? null,
    email: row.email ?? null,
    phoneNumber: row.phoneNumber ?? null,
    city: row.city ?? null,
  };
}

/**
 * When bypass is on and the dev user does not exist, upsert it so /api/me and
 * other consumers get a consistent "current user" in dev without each route
 * creating the user. Single centralized place for dev-user auto-creation.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const bypass = process.env.DEV_AUTH_BYPASS === "true";
  if (!bypass) return null;

  let userId = process.env.DEV_USER_ID ?? "dev-user";
  const h = await headers();
  const impersonateId = getImpersonateIdFromCookie(h.get("cookie"));
  if (impersonateId) userId = impersonateId;

  const userName = process.env.DEV_USER_NAME ?? "Dev User";

  const userSelect = {
    id: true,
    name: true,
    isAdmin: true,
    kycStatus: true,
    kycRejectedReason: true,
    suspendedAt: true,
    email: true,
    phoneNumber: true,
    city: true,
  } as const;

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    user = await prisma.user.upsert({
      where: { id: userId },
      update: { name: userName },
      create: { id: userId, name: userName },
      select: userSelect,
    });
  }

  return toAuthUser(user);
}

export async function requireUser(): Promise<{
  user: AuthUser | null;
  error: NextResponse | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requireAdmin(): Promise<{
  user: AuthUser | null;
  error: NextResponse | null;
}> {
  const { user, error: userError } = await requireUser();
  if (userError) return { user: null, error: userError };
  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  if (!user.isAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return user?.isAdmin ?? false;
}
