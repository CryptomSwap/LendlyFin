export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/admin-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { getDisputeStatusLabel, getDisputeReasonLabel } from "@/lib/status-labels";
import { Scale } from "lucide-react";

async function getDisputes(status?: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return [];
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = status ? `${proto}://${host}/api/admin/disputes?status=${encodeURIComponent(status)}` : `${proto}://${host}/api/admin/disputes`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.disputes ?? [];
}

async function ensureAdmin() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return false;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/me`, { cache: "no-store" });
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
    <div className="space-y-6 pb-24" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">מחלוקות – מנהל</h1>
        <AdminNav />
      </div>

      <section aria-label="סינון לפי סטטוס">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/disputes"
            className={`text-sm px-3 py-1.5 rounded-xl font-medium transition-colors ${
              !statusFilter ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            הכל
          </Link>
          <Link
            href="/admin/disputes?status=OPEN"
            className={`text-sm px-3 py-1.5 rounded-xl font-medium transition-colors ${
              statusFilter === "OPEN" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
            }`}
          >
            פתוח
          </Link>
          <Link
            href="/admin/disputes?status=UNDER_REVIEW"
            className={`text-sm px-3 py-1.5 rounded-xl font-medium transition-colors ${
              statusFilter === "UNDER_REVIEW" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
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
            <ul className="space-y-2 list-none p-0 m-0">
              {disputes.map((d: { id: string; bookingId: string; reason: string; status: string; listingTitle: string; renterName: string; createdAt: string }) => (
                <li key={d.id} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0">
                  <div className="text-sm min-w-0">
                    <span className="font-medium text-foreground">{d.listingTitle}</span>
                    <span className="text-muted-foreground"> · {d.renterName}</span>
                    <span className="text-muted-foreground"> · {getDisputeReasonLabel(d.reason)}</span>
                    <span className="text-muted-foreground"> · {getDisputeStatusLabel(d.status)}</span>
                    <span className="text-muted-foreground text-xs mr-2">
                      {" "}{new Date(d.createdAt).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                  <Link href={`/admin/disputes/${d.id}`} className="text-sm font-medium text-primary hover:underline shrink-0">
                    צפה
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
