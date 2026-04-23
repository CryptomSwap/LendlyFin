"use client";

/**
 * Trust badge UI was removed from the product. This module remains as a no-op
 * so stale bundler caches or incremental builds do not fail on a missing file.
 */
export default function TrustBadges(_props?: {
  badges?: unknown[];
  size?: string;
  className?: string;
}): null {
  return null;
}
