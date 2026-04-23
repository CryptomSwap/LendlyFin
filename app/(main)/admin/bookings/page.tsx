export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getBookingStatusLabel } from "@/lib/status-labels";
import { AdminNav } from "@/components/admin-nav";
import { PageContainer } from "@/components/layout";

async function getBookings() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return [];
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/admin/bookings`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.bookings ?? [];
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

export default async function AdminBookingsPage() {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const bookings = await getBookings();

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-title">הזמנות – מנהל</h1>
        <AdminNav />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>רשימת הזמנות</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <EmptyState variant="inline" title="אין הזמנות. ההזמנות יופיעו כאן." />
          ) : (
            <ul className="space-y-3">
              {bookings.map((b: { id: string; bookingRef?: string | null; status: string; user?: { name: string }; listing?: { title: string }; pickupChecklist?: { completedAt: string | null }; createdAt: string }) => (
                <li key={b.id} className="rounded-xl border border-border/70 bg-card px-4 py-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm min-w-0">
                      <p className="font-medium text-foreground truncate">{b.listing?.title ?? "—"}</p>
                      <p className="text-muted-foreground">
                        {b.user?.name ?? "—"} · {getBookingStatusLabel(b.status)}
                        {b.pickupChecklist?.completedAt && <span className="text-success mr-2">✔ איסוף</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.bookingRef && <span className="font-mono" dir="ltr">{b.bookingRef}</span>}
                        {b.bookingRef && " · "}
                        {new Date(b.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <Link href={`/admin/bookings/${b.id}`} className="text-sm text-primary font-medium hover:underline shrink-0">
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
