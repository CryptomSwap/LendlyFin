export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getBookingStatusLabel } from "@/lib/status-labels";
import { AdminNav } from "@/components/admin-nav";

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
    <div className="space-y-6 pb-24" dir="rtl">
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
            <ul className="space-y-2">
              {bookings.map((b: { id: string; bookingRef?: string | null; status: string; user?: { name: string }; listing?: { title: string }; pickupChecklist?: { completedAt: string | null }; createdAt: string }) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
                  <div className="text-sm">
                    {b.bookingRef && (
                      <span className="font-mono text-muted-foreground mr-2" dir="ltr">{b.bookingRef}</span>
                    )}
                    <span className="font-medium">{b.listing?.title ?? "—"}</span>
                    <span className="text-muted-foreground"> · {b.user?.name ?? "—"}</span>
                    <span className="text-muted-foreground"> · {getBookingStatusLabel(b.status)}</span>
                    {b.pickupChecklist?.completedAt && (
                      <span className="text-green-600 text-xs mr-2">✔ איסוף</span>
                    )}
                  </div>
                  <Link href={`/admin/bookings/${b.id}`} className="text-sm text-primary hover:underline">
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
