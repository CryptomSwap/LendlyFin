import { AUDIT_ENTITY, createSystemAuditLog } from "@/lib/audit";

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __rateLimitStore: Map<string, Bucket> | undefined;
}

const rateLimitStore = globalThis.__rateLimitStore ?? new Map<string, Bucket>();
if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = rateLimitStore;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  req: Request,
  options: {
    keyPrefix: string;
    windowMs: number;
    limit: number;
    identifier?: string;
    auditEntityType?: (typeof AUDIT_ENTITY)[keyof typeof AUDIT_ENTITY];
    auditEntityId?: string;
    auditTargetDisplayName?: string;
  }
): Promise<{ ok: boolean; remaining: number; retryAfterSec: number }> {
  const id = options.identifier?.trim() || getClientIp(req);
  const now = Date.now();
  const key = `${options.keyPrefix}:${id}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      ok: true,
      remaining: Math.max(0, options.limit - 1),
      retryAfterSec: Math.ceil(options.windowMs / 1000),
    };
  }

  if (current.count >= options.limit) {
    if (options.auditEntityType && options.auditEntityId) {
      void createSystemAuditLog({
        entityType: options.auditEntityType,
        entityId: options.auditEntityId,
        action: "RATE_LIMIT_DENIED",
        reason: `${options.keyPrefix}:${id}`,
        targetDisplayName: options.auditTargetDisplayName ?? null,
      });
    }
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return {
    ok: true,
    remaining: Math.max(0, options.limit - current.count),
    retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
