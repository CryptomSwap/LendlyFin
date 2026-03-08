"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Header auth entry: "התחברות" when unauthenticated, "פרופיל" when authenticated.
 * Keeps the existing auth flow; no email/password.
 */
export default function AuthHeaderLink() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-sm text-muted-foreground min-w-[4rem]" aria-hidden>
        …
      </span>
    );
  }

  if (session?.user) {
    return (
      <Link
        href="/profile"
        className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        פרופיל
      </Link>
    );
  }

  return (
    <Link
      href="/signin"
      className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
    >
      התחברות
    </Link>
  );
}
