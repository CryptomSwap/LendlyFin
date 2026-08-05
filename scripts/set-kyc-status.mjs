import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env.local or your shell env.");
  process.exit(1);
}

const VALID = new Set(["PENDING", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED"]);

const email = (process.argv[2] || "").trim().toLowerCase();
const nextStatus = (process.argv[3] || "").trim().toUpperCase();
const reasonArg = process.argv.slice(4).join(" ").trim();

if (!email || !nextStatus || !VALID.has(nextStatus)) {
  console.error(
    "Usage: npm run kyc:set-status -- <user-email> <PENDING|IN_PROGRESS|SUBMITTED|APPROVED|REJECTED> [rejection-reason]"
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, kycStatus: true, kycRejectedReason: true },
  });

  if (!user) {
    console.error(`User not found for email: ${email}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      kycStatus: nextStatus,
      kycRejectedReason: nextStatus === "REJECTED" ? (reasonArg || "Rejected by admin") : null,
      ...(nextStatus === "SUBMITTED" ? { kycSubmittedAt: new Date() } : {}),
    },
    select: { id: true, email: true, name: true, kycStatus: true, kycRejectedReason: true },
  });

  console.log("KYC status updated:");
  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to update KYC status:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
