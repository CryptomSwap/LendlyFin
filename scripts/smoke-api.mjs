const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function check(name, path, acceptedStatuses) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const ok = acceptedStatuses.includes(res.status);
  const marker = ok ? "PASS" : "FAIL";
  console.log(`${marker} ${name} -> ${res.status} ${url}`);
  if (!ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${name} failed with ${res.status}. Response: ${body.slice(0, 300)}`);
  }
}

async function main() {
  console.log(`Running smoke API checks against ${baseUrl}`);

  await check("Listings list", "/api/listings", [200, 429]);
  await check("Listings search", "/api/listings/search?q=test", [200, 429]);
  await check("Listings missing detail", "/api/listings/non-existent-id", [404, 429]);
  await check("Auth diagnostics", "/api/auth/diagnostics", [200]);

  console.log("Smoke API checks passed.");
}

main().catch((error) => {
  console.error("Smoke API checks failed:", error);
  process.exit(1);
});
