import { prisma } from "@/lib/prisma";

type AlertLevel = "info" | "warning" | "error";

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

