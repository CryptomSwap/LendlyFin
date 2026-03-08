import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/** In dev we cache both adapter and client on globalThis to survive HMR without leaking adapter instances. */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaAdapter?: InstanceType<typeof PrismaBetterSqlite3>;
};

const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaAdapter = adapter;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

