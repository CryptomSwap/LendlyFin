-- Legal acceptance fields on User (present in prisma/schema.prisma, absent from baseline).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "termsAcceptedVersion" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "privacyAcceptedVersion" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3);
