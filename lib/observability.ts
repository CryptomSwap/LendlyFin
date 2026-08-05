import { prisma } from "@/lib/prisma";

type AlertLevel = "info" | "warning" | "error";
type ObservabilityInput = {
  event: string;
  route?: string;
  actorId?: string | null;
  context?: Record<string, unknown>;
  tags?: string[];
};

export async function recordSystemAlert(input: {
  level: AlertLevel;
  source: string;
  message: string;
  context?: Record<string, unknown>;
}) {
  await prisma.systemAlert.create({
    data: {
      level: input.level,
      source: input.source,
      message: input.message,
      context: input.context ? JSON.stringify(input.context) : null,
    },
  });
}

export function logEvent(input: ObservabilityInput) {
  const payload = {
    level: "info",
    event: input.event,
    route: input.route ?? null,
    actorId: input.actorId ?? null,
    tags: input.tags ?? [],
    context: input.context ?? {},
  };
  console.info("[observability:event]", payload);
}

export function logApiError(input: ObservabilityInput & { error: unknown }) {
  const payload = {
    level: "error",
    event: input.event,
    route: input.route ?? null,
    actorId: input.actorId ?? null,
    tags: input.tags ?? [],
    context: input.context ?? {},
    error:
      input.error instanceof Error
        ? { name: input.error.name, message: input.error.message, stack: input.error.stack }
        : String(input.error),
  };
  console.error("[observability:api-error]", payload);
}

export async function forwardErrorIfConfigured(input: ObservabilityInput & { error: unknown }) {
  const shouldRecordAlert = process.env.OBSERVABILITY_ALERTS_ENABLED === "1";
  if (!shouldRecordAlert) return;

  const message =
    input.error instanceof Error
      ? input.error.message
      : typeof input.error === "string"
        ? input.error
        : "Unknown error";

  await recordSystemAlert({
    level: "error",
    source: input.route ?? input.event,
    message,
    context: {
      event: input.event,
      actorId: input.actorId ?? null,
      tags: input.tags ?? [],
      ...input.context,
    },
  });
}
