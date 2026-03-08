/**
 * Unified admin audit log: KYC, listing moderation, user suspension, disputes, overrides.
 * All admin actions are recorded in the single AuditLog table via these helpers.
 */

import { prisma } from "@/lib/prisma";

export const AUDIT_ENTITY = {
  KYC: "KYC",
  LISTING: "LISTING",
  USER: "USER",
  DISPUTE: "DISPUTE",
  OVERRIDE: "OVERRIDE",
  BOOKING: "BOOKING",
} as const;

export type AuditEntityType = (typeof AUDIT_ENTITY)[keyof typeof AUDIT_ENTITY];

type CreateAuditInput = {
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  adminUserId: string;
  adminName: string;
  reason?: string | null;
  targetDisplayName?: string | null;
};

/**
 * Append an entry to the unified admin audit log.
 * Use for KYC decisions, listing approve/reject/pause, user suspension, dispute resolution, overrides.
 */
export async function createAuditLog(input: CreateAuditInput) {
  return prisma.auditLog.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      adminUserId: input.adminUserId,
      adminName: input.adminName,
      reason: input.reason ?? undefined,
      targetDisplayName: input.targetDisplayName ?? undefined,
    },
  });
}
