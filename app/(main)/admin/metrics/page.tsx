export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/layout";
import { getAdminMetrics } from "@/lib/admin/metrics";

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

type Metrics = {
  users: {
    totalUsers: number;
    approvedKycUsers: number;
    pendingKycUsers: number;
    suspendedUsers: number;
  };
  listings: {
    totalListings: number;
    activeListings: number;
    pendingApprovalListings: number;
    rejectedListings: number;
    pausedListings: number;
    draftListings: number;
  };
  bookings: {
    totalBookings: number;
    requestedBookings: number;
    confirmedBookings: number;
    activeBookings: number;
    completedBookings: number;
    disputeBookings: number;
  };
  disputes: {
    totalDisputes: number;
    openDisputes: number;
    resolvedDisputes: number;
  };
  recent7d: {
    recentBookings7d: number;
    recentListings7d: number;
    recentUsers7d: number;
  };
};

function MetricRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1 text-sm ${highlight ? "font-medium" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default async function AdminMetricsPage() {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const metrics = await getMetrics() as Metrics | null;
  if (!metrics) {
    return (
      <div className="p-4" dir="rtl">
        <p>לא ניתן לטעון מדדים.</p>
        <Link href="/admin/users" className="text-primary underline mt-2 inline-block">
          חזרה למנהל
        </Link>
      </div>
    );
  }

  const { users, listings, bookings, disputes, recent7d } = metrics;

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">מדדים – מנהל</h1>
        <AdminNav />
      </div>

      {/* Recent 7d – quick pulse */}
      <Card>
        <CardHeader>
          <CardTitle>פעילות 7 ימים אחרונים</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">משתמשים חדשים</p>
            <p className="text-2xl font-semibold">{recent7d.recentUsers7d}</p>
          </div>
          <div>
            <p className="text-muted-foreground">מודעות חדשות</p>
            <p className="text-2xl font-semibold">{recent7d.recentListings7d}</p>
          </div>
          <div>
            <p className="text-muted-foreground">הזמנות חדשות</p>
            <p className="text-2xl font-semibold">{recent7d.recentBookings7d}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
        {/* משתמשים */}
        <Card>
          <CardHeader>
            <CardTitle>משתמשים</CardTitle>
            <Link href="/admin/users" className="text-sm text-primary hover:underline mt-1">
              לניהול משתמשים
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="סה״כ משתמשים" value={users.totalUsers} highlight />
            <MetricRow label="אימות אושר" value={users.approvedKycUsers} />
            <MetricRow label="ממתינים לאימות (נשלח)" value={users.pendingKycUsers} />
            <MetricRow label="מושעים" value={users.suspendedUsers} />
          </CardContent>
        </Card>

        {/* מודעות */}
        <Card>
          <CardHeader>
            <CardTitle>מודעות</CardTitle>
            <Link href="/admin/listings" className="text-sm text-primary hover:underline mt-1">
              לניהול מודעות
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="סה״כ מודעות" value={listings.totalListings} highlight />
            <MetricRow label="פעילות" value={listings.activeListings} />
            <MetricRow label="ממתינות לאישור" value={listings.pendingApprovalListings} />
            <MetricRow label="נדחו" value={listings.rejectedListings} />
            <MetricRow label="מושהה" value={listings.pausedListings} />
            <MetricRow label="טיוטה" value={listings.draftListings} />
          </CardContent>
        </Card>

        {/* הזמנות */}
        <Card>
          <CardHeader>
            <CardTitle>הזמנות</CardTitle>
            <Link href="/admin/bookings" className="text-sm text-primary hover:underline mt-1">
              לניהול הזמנות
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="סה״כ הזמנות" value={bookings.totalBookings} highlight />
            <MetricRow label="ממתינות" value={bookings.requestedBookings} />
            <MetricRow label="אושרו" value={bookings.confirmedBookings} />
            <MetricRow label="פעילות" value={bookings.activeBookings} />
            <MetricRow label="הושלמו" value={bookings.completedBookings} />
            <MetricRow label="במחלוקת" value={bookings.disputeBookings} />
          </CardContent>
        </Card>

        {/* מחלוקות */}
        <Card>
          <CardHeader>
            <CardTitle>מחלוקות</CardTitle>
            <Link href="/admin/disputes" className="text-sm text-primary hover:underline mt-1">
              לניהול מחלוקות
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow label="סה״כ מחלוקות" value={disputes.totalDisputes} highlight />
            <MetricRow label="פתוחות / בבדיקה" value={disputes.openDisputes} />
            <MetricRow label="הוחלט" value={disputes.resolvedDisputes} />
          </CardContent>
        </Card>
      </div>
      </PageContainer>
    </div>
  );
}
