export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { getDisputeStatusLabel, getDisputeReasonLabel } from "@/lib/status-labels";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";
import { PageContainer } from "@/components/layout";
import { Scale } from "lucide-react";

async function getDisputes(status?: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return [];
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const url = status
    ? `${proto}://${host}/api/admin/disputes?status=${encodeURIComponent(status)}`
    : `${proto}://${host}/api/admin/disputes`;
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

const DISPUTE_PILL: Record<string, RedesignStatusVariant> = {
  OPEN: "warning",
  UNDER_REVIEW: "brand",
  RESOLVED_OWNER: "success",
  RESOLVED_RENTER: "success",
  RESOLVED_SPLIT: "success",
  CLOSED: "muted",
};

export default async function AdminDisputesPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const { status: statusFilter } = await props.searchParams;
  const disputes = await getDisputes(statusFilter);

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            מחלוקות – מנהל
          </h1>
          <AdminNav />
        </div>

        <section aria-label="סינון לפי סטטוס">
          <div className="flex flex-wrap gap-2 rounded-[8px] border border-black/10 bg-white p-2">
            <Link
              href="/admin/disputes"
              className={`brand-chip ${!statusFilter ? "brand-chip-active" : "brand-chip-idle"}`}
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

        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <h2 className="mb-3 font-sans text-[15px] font-black text-black">רשימת מחלוקות</h2>
          {disputes.length === 0 ? (
            <EmptyState
              icon={<Scale className="h-12 w-12 text-[#888888]" aria-hidden />}
              title="אין מחלוקות"
              subtitle={
                statusFilter
                  ? "אין מחלוקות בסטטוס זה. נסה סינון אחר."
                  : "כל המחלוקות טופלו או שעדיין לא נפתחו."
              }
              className="py-8"
            />
          ) : (
            <ul className="m-0 list-none space-y-2 p-0">
              {disputes.map(
                (d: {
                  id: string;
                  bookingId: string;
                  reason: string;
                  status: string;
                  listingTitle: string;
                  renterName: string;
                  createdAt: string;
                }) => (
                  <li
                    key={d.id}
                    className="rounded-[8px] border border-black/10 bg-white px-3 py-2.5"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-sans text-[14px] font-bold text-black">
                            {d.listingTitle}
                          </p>
                          <RedesignStatusPill variant={DISPUTE_PILL[d.status] ?? "muted"}>
                            {getDisputeStatusLabel(d.status)}
                          </RedesignStatusPill>
                        </div>
                        <p className="font-assistant text-[13px] text-[#888888]">
                          {d.renterName} · {getDisputeReasonLabel(d.reason)}
                        </p>
                        <p className="font-assistant text-[12px] text-[#888888]">
                          {new Date(d.createdAt).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                      <Link
                        href={`/admin/disputes/${d.id}`}
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
