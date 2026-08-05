/**
 * Auth adapter facade: single entry point for auth in routes.
 * Uses real session adapter (Google) unless DEV_AUTH_BYPASS=true for local dev.
 */

import * as dev from "./dev-adapter";
import * as session from "./session-adapter";
import { validateRuntimeEnv } from "@/lib/env";

validateRuntimeEnv();

const bypassRequested = process.env.DEV_AUTH_BYPASS === "true";
const useDevAdapter =
  bypassRequested &&
  process.env.NODE_ENV !== "production";
const adapter = useDevAdapter ? dev : session;

export type { AuthUser } from "./types";

export const getCurrentUser = adapter.getCurrentUser;
export const requireUser = adapter.requireUser;
export const requireAdmin = adapter.requireAdmin;
export const isAdminUser = adapter.isAdminUser;
