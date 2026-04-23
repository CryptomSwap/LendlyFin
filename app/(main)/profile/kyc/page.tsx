import { headers } from "next/headers";
import { redirect } from "next/navigation";
import KYCFlow from "@/components/kyc-flow";
import { PageContainer } from "@/components/layout";

export const runtime = "nodejs";

async function getMe() {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const url = `${proto}://${host}/api/me`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
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
    <div className="min-h-screen w-full app-page-bg pb-24">
      <PageContainer width="narrow" className="space-y-6 lg:max-w-[62rem]" >
        <h1 className="page-title">אימות זהות</h1>
        <KYCFlow />
      </PageContainer>
    </div>
  );
}
