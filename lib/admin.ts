/**
 * Compatibility layer: re-exports auth adapter for existing route imports.
 * All auth lookup lives in lib/auth/*; use @/lib/admin or @/lib/auth/adapter.
 */

export {
  getCurrentUser,
  requireUser,
  requireAdmin,
  isAdminUser,
} from "@/lib/auth/adapter";

export type { AuthUser } from "@/lib/auth/adapter";
