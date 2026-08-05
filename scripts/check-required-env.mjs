const required = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL"];

const missing = required.filter((name) => {
  const value = process.env[name];
  return typeof value !== "string" || value.trim().length === 0;
});

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

if ((process.env.NODE_ENV || "").trim().toLowerCase() === "production") {
  const bypass = (process.env.DEV_AUTH_BYPASS || "").trim().toLowerCase();
  if (bypass === "true" || bypass === "1" || bypass === "yes") {
    console.error("DEV_AUTH_BYPASS must be disabled in production.");
    process.exit(1);
  }
}

console.log("Required environment variables are present.");
