import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminKYCReview from "@/components/admin-kyc-review";
import { AdminNav } from "@/components/admin-nav";
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

export default async function AdminKYCPage() {
  const meData = await getMe();

  if (!meData) {
    redirect("/profile");
  }

  const me = meData.user || meData;
  
  if (!me.isAdmin) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24">
      <PageContainer width="wide" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-title">אימות זהות - ביקורת מנהל</h1>
        <AdminNav />
      </div>
      <AdminKYCReview />
      </PageContainer>
    </div>
  );
}
