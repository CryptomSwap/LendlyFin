import { headers } from "next/headers";
import { redirect } from "next/navigation";
import KYCFlow from "@/components/kyc-flow";

export const runtime = "nodejs";

async function getMe() {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/me`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function KYCPage() {
  const me = await getMe();

  if (!me) {
    redirect("/profile");
  }

  const kycStatus = me.user?.kycStatus || me.kycStatus || "PENDING";

  // If already submitted, approved, or rejected, redirect to profile
  if (kycStatus === "SUBMITTED" || kycStatus === "APPROVED" || kycStatus === "REJECTED") {
    redirect("/profile");
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">אימות זהות</h1>
      <KYCFlow />
    </div>
  );
}
