export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { getBookingStatusLabel, getBookingStatusPillVariant } from "@/lib/status-labels";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";
import { AdminNav } from "@/components/admin-nav";
import { PageContainer } from "@/components/layout";

async function getBookings() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return [];
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/admin/bookings`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.bookings ?? [];
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

function toRedesignVariant(
  variant: ReturnType<typeof getBookingStatusPillVariant>
): RedesignStatusVariant {
  return variant === "primary" ? "brand" : variant;
}

export default async function AdminBookingsPage() {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const bookings = await getBookings();

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            הזמנות – מנהל
          </h1>
          <AdminNav />
        </div>

        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-5">
          <h2 className="mb-3 font-sans text-[15px] font-black text-black">רשימת הזמנות</h2>
          {bookings.length === 0 ? (
            <EmptyState variant="inline" title="אין הזמנות. ההזמנות יופיעו כאן." />
          ) : (
            <ul className="space-y-2">
              {bookings.map(
                (b: {
                  id: string;
                  bookingRef?: string | null;
                  status: string;
                  user?: { name: string };
                  listing?: { title: string };
                  pickupChecklist?: { completedAt: string | null };
                  createdAt: string;
                }) => (
                  <li
                    key={b.id}
                    className="rounded-[8px] border border-black/10 bg-white px-3 py-2.5"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-sans text-[14px] font-bold text-black">
                            {b.listing?.title ?? "—"}
                          </p>
                          <RedesignStatusPill
                            variant={toRedesignVariant(getBookingStatusPillVariant(b.status))}
                          >
                            {getBookingStatusLabel(b.status)}
                          </RedesignStatusPill>
                          {b.pickupChecklist?.completedAt && (
                            <RedesignStatusPill variant="success">✔ איסוף</RedesignStatusPill>
                          )}
                        </div>
                        <p className="font-assistant text-[13px] text-[#888888]">
                          {b.user?.name ?? "—"}
                        </p>
                        <p className="font-assistant text-[12px] text-[#888888]">
                          {b.bookingRef && (
                            <span className="font-mono" dir="ltr">
                              {b.bookingRef}
                            </span>
                          )}
                          {b.bookingRef && " · "}
                          {new Date(b.createdAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="shrink-0 font-sans text-[13px] font-bold text-[#1A8C6A] hover:underline"
                      >
                        צפה
                      </Link>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
