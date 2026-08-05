import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getPgPoolConfig } from "@/lib/pg-pool-config";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaAdapter?: InstanceType<typeof PrismaBetterSqlite3>;
  prismaPool?: Pool;
};

let prodPrisma: PrismaClient | undefined;

const LOCAL_SQLITE_URL = "file:./prisma/dev.db";

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return LOCAL_SQLITE_URL;
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (e.g. postgresql://USER:PASSWORD@localhost:5432/lendly)"
  );
}

function isSqliteUrl(url: string): boolean {
  return url.startsWith("file:");
}

function createPrismaClient(): PrismaClient {
  const url = resolveDatabaseUrl();

  if (isSqliteUrl(url)) {
    const adapter =
      globalForPrisma.prismaAdapter ??
      new PrismaBetterSqlite3({
        url,
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaAdapter = adapter;
    }
    return new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  }

  const pool = globalForPrisma.prismaPool ?? new Pool(getPgPoolConfig(url));
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }
  prodPrisma ??= createPrismaClient();
  return prodPrisma;
}

/**
 * Lazy client: no adapter / PrismaClient until first property access.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver) as unknown;
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
