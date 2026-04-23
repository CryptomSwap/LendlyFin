export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/admin-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { getDisputeStatusLabel, getDisputeReasonLabel } from "@/lib/status-labels";
import { PageContainer } from "@/components/layout";
import { Scale } from "lucide-react";

async function getDisputes(status?: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return [];
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const url = status ? `${proto}://${host}/api/admin/disputes?status=${encodeURIComponent(status)}` : `${proto}://${host}/api/admin/disputes`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.disputes ?? [];
}

async function ensureAdmin() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return false;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return false;
  const data = await res.json();
  const me = data.user || data;
  return !!me?.isAdmin;
}

export default async function AdminDisputesPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const { status: statusFilter } = await props.searchParams;
  const disputes = await getDisputes(statusFilter);

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">מחלוקות – מנהל</h1>
        <AdminNav />
      </div>

      <section aria-label="סינון לפי סטטוס">
        <div className="flex gap-2 flex-wrap rounded-xl border border-border/70 bg-card p-2">
          <Link
            href="/admin/disputes"
            className={`brand-chip ${
              !statusFilter ? "brand-chip-active" : "brand-chip-idle"
            }`}
          >
            הכל
          </Link>
          <Link
            href="/admin/disputes?status=OPEN"
            className={`brand-chip ${
              statusFilter === "OPEN" ? "brand-chip-active" : "brand-chip-idle"
            }`}
          >
            פתוח
          </Link>
          <Link
            href="/admin/disputes?status=UNDER_REVIEW"
            className={`brand-chip ${
              statusFilter === "UNDER_REVIEW" ? "brand-chip-active" : "brand-chip-idle"
            }`}
          >
            בבדיקה
          </Link>
        </div>
      </section>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">רשימת מחלוקות</CardTitle>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <EmptyState
              icon={<Scale className="h-12 w-12 text-muted-foreground" aria-hidden />}
              title="אין מחלוקות"
              subtitle={statusFilter ? "אין מחלוקות בסטטוס זה. נסה סינון אחר." : "כל המחלוקות טופלו או שעדיין לא נפתחו."}
              className="py-8"
            />
          ) : (
            <ul className="space-y-3 list-none p-0 m-0">
              {disputes.map((d: { id: string; bookingId: string; reason: string; status: string; listingTitle: string; renterName: string; createdAt: string }) => (
                <li key={d.id} className="rounded-xl border border-border/70 bg-card px-4 py-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm min-w-0">
                      <p className="font-medium text-foreground truncate">{d.listingTitle}</p>
                      <p className="text-muted-foreground">
                        {d.renterName} · {getDisputeReasonLabel(d.reason)} · {getDisputeStatusLabel(d.status)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <Link href={`/admin/disputes/${d.id}`} className="text-sm font-medium text-primary hover:underline shrink-0">
                      צפה
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      </PageContainer>
    </div>
  );
}
