-- Add pilot onboarding and Google auth fields to User
ALTER TABLE "User" ADD COLUMN "email" TEXT;
ALTER TABLE "User" ADD COLUMN "image" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
