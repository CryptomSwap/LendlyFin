import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * `prisma generate` does not need a reachable DB, but Prisma 7 still loads this URL.
 * Use a placeholder when `DATABASE_URL` is unset so `npm install` / Vercel build does not fail.
 * Runtime and `migrate` still require a real `DATABASE_URL` in the environment.
 */
const datasourceUrl =
  process.env.DATABASE_URL?.trim() ||
  "file:./prisma/dev.db";

export default defineConfig({
  datasource: {
    url: datasourceUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: 'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
});
