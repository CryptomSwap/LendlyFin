/**
 * Real auth adapter: uses NextAuth session (Google sign-in, JWT).
 * getCurrentUser() resolves session to our Prisma User and returns AuthUser.
 */

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/nextauth-options";
import type { AuthUser } from "./types";

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

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  return user ? toAuthUser(user) : null;
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
  if (!user)
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };

  if (!user.isAdmin) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
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
