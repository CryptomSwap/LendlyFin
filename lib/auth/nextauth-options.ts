/**
 * NextAuth options for Google sign-in. Used by the API route and by getServerSession in session-adapter.
 * JWT strategy: we find/create our Prisma User by Google email and store our user id in the token.
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
const hasGoogleCredentials = googleClientId.length > 0 && googleClientSecret.length > 0;

if (process.env.NODE_ENV !== "production") {
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL?.trim() ? "present" : "missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET?.trim() ? "present" : "missing",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim() ? "present" : "missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.trim() ? "present" : "missing",
  };
  console.log("[NextAuth] env check (dev only):", envCheck);
  if (!hasGoogleCredentials) {
    console.error(
      "[NextAuth] Google OAuth is not configured. Create .env.local from .env.example in the project root, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart the dev server. " +
        "See docs/LOCAL_GOOGLE_AUTH.md."
    );
  }
}

export const isGoogleProviderConfigured = hasGoogleCredentials;

function isOnboardingComplete(u: {
  name?: string | null;
  phoneNumber?: string | null;
  city?: string | null;
}): boolean {
  const name = typeof u.name === "string" ? u.name.trim() : "";
  const phone = typeof u.phoneNumber === "string" ? u.phoneNumber.trim() : "";
  const city = typeof u.city === "string" ? u.city.trim() : "";
  return name.length > 0 && phone.length > 0 && city.length > 0;
}

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
    onboardingComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    lendlyUserId?: string;
    onboardingComplete?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: hasGoogleCredentials
    ? [
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          authorization: {
            params: {
              prompt: "consent",
              scope: "openid email profile",
            },
          },
        }),
      ]
    : [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile && "email" in profile && profile.email) {
        const email = profile.email as string;
        const rawName = (profile.name as string) ?? profile.email;
        const name =
          (typeof rawName === "string" && rawName.trim()) ? rawName.trim()
          : (typeof profile.email === "string" && profile.email) || "User";
        const image =
          ("picture" in profile && typeof profile.picture === "string"
            ? profile.picture
            : null) ?? null;
        let dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, phoneNumber: true, city: true },
        });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              name,
              image: image ?? undefined,
            },
            select: { id: true, name: true, phoneNumber: true, city: true },
          });
          if (process.env.NODE_ENV !== "production") {
            console.log("[NextAuth] user created", { id: dbUser.id, namePresent: !!dbUser.name });
          }
        } else {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              name: name || undefined,
              image: image ?? undefined,
            },
          });
          dbUser = await prisma.user.findUnique({
            where: { id: dbUser.id },
            select: { id: true, name: true, phoneNumber: true, city: true },
          }) ?? dbUser;
          if (process.env.NODE_ENV !== "production") {
            console.log("[NextAuth] user updated", { id: dbUser.id, namePresent: !!dbUser?.name });
          }
        }
        token.lendlyUserId = dbUser.id;
        token.onboardingComplete = isOnboardingComplete(dbUser);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.lendlyUserId ?? (token.sub as string);
        session.onboardingComplete = token.onboardingComplete ?? false;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
