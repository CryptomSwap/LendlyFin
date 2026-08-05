export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout";
import { getAdminMetrics } from "@/lib/admin/metrics";
import type { AdminMetrics } from "@/lib/admin/metrics";

async function getMetrics() {
  return getAdminMetrics();
}

async function ensureAdmin() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return false;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return false;
  const data = await res.json();
  const me = data.user || data;
  return !!me?.isAdmin;
}

type Metrics = AdminMetrics;

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 py-1 text-sm ${highlight ? "font-sans font-bold" : ""}`}>
      <span className="font-assistant text-[#888888]">{label}</span>
      <span className="font-assistant text-black tabular-nums">{value}</span>
    </div>
  );
}

export default async function AdminMetricsPage() {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const metrics: Metrics | null = await getMetrics();
  if (!metrics) {
    return (
      <div className="p-4" dir="rtl">
        <p className="font-assistant text-black">לא ניתן לטעון מדדים.</p>
        <Link href="/admin/users" className="mt-2 inline-block font-sans font-bold text-[#1A8C6A] underline">
          חזרה
        </Link>
      </div>
    );
  }

  const { users, listings, bookings, disputes, recent7d } = metrics;

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            מדדים – מנהל
          </h1>
          <AdminNav />
        </div>

        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <h2 className="mb-3 font-sans text-[15px] font-black text-black">
            פעילות 7 ימים אחרונים
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-assistant text-[12px] text-[#888888]">משתמשים חדשים</p>
              <p className="font-sans text-[28px] font-black text-black">{recent7d.recentUsers7d}</p>
            </div>
            <div>
              <p className="font-assistant text-[12px] text-[#888888]">מודעות חדשות</p>
              <p className="font-sans text-[28px] font-black text-black">{recent7d.recentListings7d}</p>
            </div>
            <div>
              <p className="font-assistant text-[12px] text-[#888888]">הזמנות חדשות</p>
              <p className="font-sans text-[28px] font-black text-black">{recent7d.recentBookings7d}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-sans text-[15px] font-black text-black">משתמשים</h2>
              <Link href="/admin/users" className="font-sans text-[12px] font-bold text-[#1A8C6A] hover:underline">
                לניהול משתמשים
              </Link>
            </div>
            <MetricRow label="סה״כ משתמשים" value={users.totalUsers} highlight />
            <MetricRow label="אימות אושר" value={users.approvedKycUsers} />
            <MetricRow label="ממתינים לאימות (נשלח)" value={users.pendingKycUsers} />
            <MetricRow label="מושעים" value={users.suspendedUsers} />
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-sans text-[15px] font-black text-black">מודעות</h2>
              <Link href="/admin/listings" className="font-sans text-[12px] font-bold text-[#1A8C6A] hover:underline">
                לניהול מודעות
              </Link>
            </div>
            <MetricRow label="סה״כ מודעות" value={listings.totalListings} highlight />
            <MetricRow label="פעילות" value={listings.activeListings} />
            <MetricRow label="ממתינות לאישור" value={listings.pendingApprovalListings} />
            <MetricRow label="נדחו" value={listings.rejectedListings} />
            <MetricRow label="מושהה" value={listings.pausedListings} />
            <MetricRow label="טיוטה" value={listings.draftListings} />
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-sans text-[15px] font-black text-black">הזמנות</h2>
              <Link href="/admin/bookings" className="font-sans text-[12px] font-bold text-[#1A8C6A] hover:underline">
                לניהול הזמנות
              </Link>
            </div>
            <MetricRow label="סה״כ הזמנות" value={bookings.totalBookings} highlight />
            <MetricRow label="ממתינות" value={bookings.requestedBookings} />
            <MetricRow label="אושרו" value={bookings.confirmedBookings} />
            <MetricRow label="פעילות" value={bookings.activeBookings} />
            <MetricRow label="הושלמו" value={bookings.completedBookings} />
            <MetricRow label="במחלוקת" value={bookings.disputeBookings} />
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-sans text-[15px] font-black text-black">מחלוקות</h2>
              <Link href="/admin/disputes" className="font-sans text-[12px] font-bold text-[#1A8C6A] hover:underline">
                לניהול מחלוקות
              </Link>
            </div>
            <MetricRow label="סה״כ מחלוקות" value={disputes.totalDisputes} highlight />
            <MetricRow label="פתוחות / בבדיקה" value={disputes.openDisputes} />
            <MetricRow label="הוחלט" value={disputes.resolvedDisputes} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
