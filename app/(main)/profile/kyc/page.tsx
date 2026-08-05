import { headers } from "next/headers";
import { redirect } from "next/navigation";
import KYCFlow from "@/components/kyc-flow";
import { PageContainer, SurfaceCard } from "@/components/layout";

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

  // Only block when already in review or approved.
  // Rejected users should be allowed to re-submit.
  if (kycStatus === "SUBMITTED" || kycStatus === "APPROVED") {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6 pt-8 lg:max-w-[62rem]">
        <div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            אימות זהות
          </h1>
          <p className="mt-2 font-assistant text-[14px] text-[#888888]">
            נעבור יחד צעד-אחר-צעד כדי לאמת את זהותך.
          </p>
        </div>
        <SurfaceCard padding="lg">
          <KYCFlow />
        </SurfaceCard>
      </PageContainer>
    </div>
  );
}
