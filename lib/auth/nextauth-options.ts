/**
 * NextAuth options for Google sign-in. Used by the API route and by getServerSession in session-adapter.
 * JWT strategy: we find/create our Prisma User by Google email and store our user id in the token.
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
const hasGoogleCredentials = googleClientId.length > 0 && googleClientSecret.length > 0;

export const isGoogleProviderConfigured = hasGoogleCredentials;

/** Must match NextAuth’s defaultCookies() secure-prefix rules (see next-auth/core/lib/cookie.js). */
function useSecureCookiePrefix(): boolean {
  return (
    Boolean(process.env.NEXTAUTH_URL?.startsWith("https://")) ||
    process.env.VERCEL === "1"
  );
}

/** Default OAuth state/PKCE maxAge is 15m; slow consent / tab sleep drops cookies → OAUTH_CALLBACK_ERROR. */
const OAUTH_EPHEMERAL_COOKIE_MAX_AGE_SEC = 60 * 60;

function oauthEphemeralCookies(): NonNullable<NextAuthOptions["cookies"]> {
  const secure = useSecureCookiePrefix();
  const prefix = secure ? "__Secure-" : "";
  return {
    state: {
      name: `${prefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
        maxAge: OAUTH_EPHEMERAL_COOKIE_MAX_AGE_SEC,
      },
    },
    pkceCodeVerifier: {
      name: `${prefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
        maxAge: OAUTH_EPHEMERAL_COOKIE_MAX_AGE_SEC,
      },
    },
  };
}

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
    async jwt({ token, account, profile, user }) {
      const profileEmail =
        profile && "email" in profile && typeof profile.email === "string"
          ? profile.email
          : null;
      const resolvedEmail =
        (typeof user?.email === "string" && user.email.trim()) ||
        (typeof profileEmail === "string" && profileEmail.trim()) ||
        (typeof token.email === "string" && token.email.trim()) ||
        "";

      if (account && resolvedEmail) {
        try {
          const email = resolvedEmail;
          const rawName =
            (profile && "name" in profile && typeof profile.name === "string" ? profile.name : null) ??
            user?.name ??
            email;
          const name =
            (typeof rawName === "string" && rawName.trim()) ? rawName.trim()
            : email || "User";
          const image =
            (profile && "picture" in profile && typeof profile.picture === "string"
              ? profile.picture
              : null) ?? null;
          let dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, phoneNumber: true, city: true, image: true },
          });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name,
                image: image ?? undefined,
              },
              select: { id: true, name: true, phoneNumber: true, city: true, image: true },
            });
            if (process.env.NODE_ENV !== "production") {
              console.log("[NextAuth] user created", { id: dbUser.id, namePresent: !!dbUser.name });
            }
          } else {
            const profileUpdates: { name?: string; image?: string } = {};
            if (name && name !== dbUser.name) profileUpdates.name = name;
            if (image && image !== dbUser.image) profileUpdates.image = image;
            if (Object.keys(profileUpdates).length > 0) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: profileUpdates,
              });
              dbUser = await prisma.user.findUnique({
                where: { id: dbUser.id },
                select: { id: true, name: true, phoneNumber: true, city: true, image: true },
              }) ?? dbUser;
              if (process.env.NODE_ENV !== "production") {
                console.log("[NextAuth] user updated", { id: dbUser.id, namePresent: !!dbUser?.name });
              }
            }
          }
          token.lendlyUserId = dbUser.id;
          token.onboardingComplete = isOnboardingComplete(dbUser);
        } catch (error) {
          // Avoid hard auth failure (error=Callback) if DB schema lags or has partial columns.
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const email = resolvedEmail;
            const fallback = await prisma.user.findUnique({
              where: { email },
              select: { id: true },
            });
            if (fallback) {
              token.lendlyUserId = fallback.id;
            }
            token.onboardingComplete = true;
          } else {
            throw error;
          }
        }
      }

      // Recovery path: if token lacks mapped app user id, try resolving by token email.
      if (!token.lendlyUserId && typeof token.email === "string" && token.email.trim()) {
        const existing = await prisma.user.findUnique({
          where: { email: token.email.trim() },
          select: { id: true, name: true, phoneNumber: true, city: true },
        });
        if (existing) {
          token.lendlyUserId = existing.id;
          token.onboardingComplete = isOnboardingComplete(existing);
        }
      }

      // Middleware reads onboardingComplete from the JWT — refresh from DB on every JWT hop so
      // completing /onboarding updates access without requiring sign-out (avoids profile ↔ onboarding redirect loops).
      if (typeof token.lendlyUserId === "string" && token.lendlyUserId.length > 0) {
        try {
          const row = await prisma.user.findUnique({
            where: { id: token.lendlyUserId },
            select: { name: true, phoneNumber: true, city: true },
          });
          if (row) {
            token.onboardingComplete = isOnboardingComplete(row);
          }
        } catch {
          // Keep existing token flags if DB read fails.
        }
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
  cookies: oauthEphemeralCookies(),
};
