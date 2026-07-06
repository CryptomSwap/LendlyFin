import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "file:./prisma/dev.db",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
});
