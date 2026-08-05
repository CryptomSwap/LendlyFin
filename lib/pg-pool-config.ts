import type { PoolConfig } from "pg";

/**
 * Pool options for `pg` + Prisma adapter.
 *
 * - Set DATABASE_SSL_STRICT=true to always verify TLS (default for non-Supabase URLs).
 * - Supabase: Node on some Windows/network setups hits "self-signed certificate in chain"
 *   with strict verify; we relax TLS for `*.supabase.co` unless DATABASE_SSL_STRICT is set.
 * - Or set DATABASE_SSL_REJECT_UNAUTHORIZED=false explicitly (same relax behavior).
 */
export function getPgPoolConfig(connectionString: string): PoolConfig {
  const strict =
    process.env.DATABASE_SSL_STRICT === "true" ||
    process.env.DATABASE_SSL_STRICT === "1";

  const explicitRelax =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "false" ||
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "0";

  const isSupabaseHost =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com");

  const relaxSsl =
    !strict && (explicitRelax || isSupabaseHost);

  // URL `sslmode=require` is mapped to verify-full in newer `pg`; that can ignore
  // `ssl.rejectUnauthorized: false`. Strip sslmode when we relax TLS.
  let conn = connectionString;
  if (relaxSsl) {
    conn = conn
      .replace(/\?sslmode=[^&]*/i, "")
      .replace(/&sslmode=[^&]*/i, "");
  }

  return {
    connectionString: conn,
    connectionTimeoutMillis: 10_000,
    ...(relaxSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}
