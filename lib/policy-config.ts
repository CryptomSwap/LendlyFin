import { prisma } from "@/lib/prisma";

export type EffectivePolicy = {
  version: string;
  lateReturnGraceMinutes: number;
  cancelPenaltyWindowHours: number;
  noShowPenaltyMode: string;
  maxLateFeePercent: number;
};

const FALLBACK_POLICY: EffectivePolicy = {
  version: "default-v1",
  lateReturnGraceMinutes: 30,
  cancelPenaltyWindowHours: 6,
  noShowPenaltyMode: "PARTIAL_DEPOSIT",
  maxLateFeePercent: 100,
};

export async function getActivePolicyConfig(): Promise<EffectivePolicy> {
  const active = await prisma.policyConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (!active) return FALLBACK_POLICY;
  return {
    version: active.version,
    lateReturnGraceMinutes: active.lateReturnGraceMinutes,
    cancelPenaltyWindowHours: active.cancelPenaltyWindowHours,
    noShowPenaltyMode: active.noShowPenaltyMode,
    maxLateFeePercent: active.maxLateFeePercent,
  };
}
