import { execSync } from "node:child_process";

function run(command) {
  return execSync(command, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function parseJson(command) {
  const raw = run(command);
  return JSON.parse(raw);
}

try {
  const repoFull = run("git config --get remote.origin.url")
    .replace(/^https:\/\/github\.com\//, "")
    .replace(/^git@github\.com:/, "")
    .replace(/\.git$/, "");

  if (!repoFull.includes("/")) {
    throw new Error("Unable to resolve owner/repo from origin remote.");
  }

  const [owner, repo] = repoFull.split("/");
  const data = parseJson(
    `gh api repos/${owner}/${repo}/branches/main/protection`
  );

  const checks =
    data?.required_status_checks?.checks?.map((c) => c.context) ?? [];
  const requiresPr = !!data?.required_pull_request_reviews;
  const requiresChecks = !!data?.required_status_checks;
  const hasValidate = checks.includes("validate");
  const hasSmoke = checks.includes("smoke-api");

  const failures = [];
  if (!requiresPr) failures.push("required pull request reviews are disabled");
  if (!requiresChecks) failures.push("required status checks are disabled");
  if (!hasValidate) failures.push("required status check 'validate' is missing");
  if (!hasSmoke) failures.push("required status check 'smoke-api' is missing");

  if (failures.length > 0) {
    console.error("Branch protection check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("Branch protection is configured for beta baseline.");
} catch (error) {
  console.error("Failed to verify branch protection.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
