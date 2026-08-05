import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env.local or your shell env.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

async function main() {
  const email = (process.argv[2] || "").trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run admin:grant -- <user-email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  if (user.isAdmin) {
    console.log(`User is already admin: ${user.email} (${user.id})`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: true },
    select: { id: true, email: true, name: true, isAdmin: true },
  });

  console.log("Admin granted successfully:");
  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to grant admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
