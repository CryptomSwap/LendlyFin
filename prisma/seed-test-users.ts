/**
 * Add only the test users (admin, lender, renter) without wiping the database.
 * Run: npm run db:seed-test-users
 */

import { createSeedClient } from "./seed-db";

const { prisma, pool } = createSeedClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@lendly.test" },
    update: {
      name: "Admin",
      isAdmin: true,
      phoneNumber: "0500000000",
      city: "תל אביב",
      kycStatus: "APPROVED",
    },
    create: {
      email: "admin@lendly.test",
      name: "Admin",
      isAdmin: true,
      phoneNumber: "0500000000",
      city: "תל אביב",
      kycStatus: "APPROVED",
    },
  });

  await prisma.user.upsert({
    where: { email: "lender@lendly.test" },
    update: {
      name: "Test Lender",
      isAdmin: false,
      phoneNumber: "0500000001",
      city: "תל אביב",
      kycStatus: "APPROVED",
    },
    create: {
      email: "lender@lendly.test",
      name: "Test Lender",
      isAdmin: false,
      phoneNumber: "0500000001",
      city: "תל אביב",
      kycStatus: "APPROVED",
    },
  });

  await prisma.user.upsert({
    where: { email: "renter@lendly.test" },
    update: {
      name: "Test Renter",
      isAdmin: false,
      phoneNumber: "0500000002",
      city: "ירושלים",
      kycStatus: "PENDING",
    },
    create: {
      email: "renter@lendly.test",
      name: "Test Renter",
      isAdmin: false,
      phoneNumber: "0500000002",
      city: "ירושלים",
      kycStatus: "PENDING",
    },
  });

  console.log("Test users added/updated: admin@lendly.test, lender@lendly.test, renter@lendly.test");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
