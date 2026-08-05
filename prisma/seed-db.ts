/**
 * Prisma client for seed scripts (PostgreSQL via pg adapter).
 * Loads .env / .env.local so DATABASE_URL and DATABASE_SSL_* are set when Prisma spawns ts-node.
 */
import { resolve } from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getPgPoolConfig } from "../lib/pg-pool-config";

config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

export function createSeedClient(): { prisma: PrismaClient; pool: Pool } {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is required for seeding. Example: postgresql://USER:PASSWORD@localhost:5432/lendly"
    );
  }
  const pool = new Pool(getPgPoolConfig(url));
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["warn", "error"],
  });
  return { prisma, pool };
}
