const PRODUCTION_REQUIRED_ENV_VARS = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "DATABASE_URL",
] as const;

let validated = false;

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function validateRuntimeEnv(): void {
  if (validated) return;

  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    validated = true;
    return;
  }

  const missing = PRODUCTION_REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables in production: ${missing.join(", ")}`
    );
  }

  if (isTruthy(process.env.DEV_AUTH_BYPASS)) {
    throw new Error(
      "[env] DEV_AUTH_BYPASS must be disabled in production"
    );
  }

  validated = true;
}
