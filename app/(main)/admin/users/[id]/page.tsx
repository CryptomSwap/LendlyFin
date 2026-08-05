export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getBookingStatusLabel } from "@/lib/status-labels";
import { SuspendActions } from "./suspend-actions";
import { PageContainer } from "@/components/layout";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";

async function getUser(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/admin/users/${id}`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return null;
  return res.json();
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

const KYC_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  IN_PROGRESS: "בתהליך",
  SUBMITTED: "נשלח",
  APPROVED: "מאומת",
  REJECTED: "נדחה",
};

const KYC_PILL: Record<string, RedesignStatusVariant> = {
  PENDING: "warning",
  IN_PROGRESS: "warning",
  SUBMITTED: "brand",
  APPROVED: "success",
  REJECTED: "danger",
};

export default async function AdminUserDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const { id } = await props.params;
  const user = await getUser(id);

  if (!user) {
    return (
      <div className="p-4" dir="rtl">
        <p>משתמש לא נמצא</p>
        <Link href="/admin/users" className="text-[#1A8C6A] underline mt-2 inline-block">
          חזרה לרשימת משתמשים
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 font-assistant text-[13px] text-[#888888] hover:text-black"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה למשתמשים
        </Link>
      </div>

      <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">משתמש – {user.name}</h1>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">פרטים</h2>
        </div>
        <div className="space-y-2 font-assistant text-[13px] text-black">
          <p><span className="font-sans font-bold">מזהה:</span> {user.id}</p>
          <p><span className="font-sans font-bold">שם:</span> {user.name}</p>
          <p><span className="font-sans font-bold">מנהל:</span> {user.isAdmin ? "כן" : "לא"}</p>
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-sans font-bold">אימות זהות:</span>{" "}
            {user.kycStatus ? (
              <RedesignStatusPill variant={KYC_PILL[user.kycStatus] ?? "muted"}>
                {KYC_LABELS[user.kycStatus] ?? user.kycStatus}
              </RedesignStatusPill>
            ) : (
              "—"
            )}
          </p>
          {user.kycSubmittedAt && (
            <p><span className="font-sans font-bold">נשלח לאימות:</span> {new Date(user.kycSubmittedAt).toLocaleString("he-IL")}</p>
          )}
          {user.kycRejectedReason && (
            <p><span className="font-sans font-bold">סיבת דחייה:</span> {user.kycRejectedReason}</p>
          )}
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-sans font-bold">מושעה:</span>{" "}
            {user.suspendedAt ? (
              <>
                <RedesignStatusPill variant="warning">מושעה</RedesignStatusPill>
                <span>
                  {new Date(user.suspendedAt).toLocaleString("he-IL")}
                  {user.suspensionReason ? ` · ${user.suspensionReason}` : ""}
                </span>
              </>
            ) : (
              "לא"
            )}
          </p>
          {user.createdAt && (
            <p><span className="font-sans font-bold">נרשם:</span> {new Date(user.createdAt).toLocaleString("he-IL")}</p>
          )}
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">פעולות</h2>
        </div>
        <div>
          <SuspendActions
            userId={user.id}
            suspended={!!user.suspendedAt}
            userName={user.name}
          />
          <div className="mt-4">
            <Link href={`/admin/kyc?userId=${user.id}`} className="text-sm text-[#1A8C6A] hover:underline">
              ביקורת אימות זהות
            </Link>
            {" · "}
            <Link href={`/admin/bookings?userId=${user.id}`} className="text-sm text-[#1A8C6A] hover:underline">
              הזמנות של משתמש
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">סטטיסטיקות</h2>
        </div>
        <div className="space-y-2 font-assistant text-[13px] text-black">
          <p><span className="font-sans font-bold">הזמנות:</span> {user.bookingsCount}</p>
          <p><span className="font-sans font-bold">מחלוקות שנפתחו על ידי משתמש:</span> {user.disputesOpenedCount}</p>
          <p><span className="font-sans font-bold">מודעות:</span> {user.listingsCount}</p>
        </div>
      </div>

      {user.recentBookings && user.recentBookings.length > 0 && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <div className="mb-2">
            <h2 className="font-sans text-[15px] font-black text-black">הזמנות אחרונות</h2>
          </div>
          <div>
            <ul className="space-y-2 text-sm">
              {user.recentBookings.map((b: { id: string; status: string; listingTitle: string; startDate: string; endDate: string }) => (
                <li key={b.id} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-black/10 pb-2 last:border-0">
                  <span>{b.listingTitle} · {getBookingStatusLabel(b.status)}</span>
                  <Link href={`/admin/bookings/${b.id}`} className="text-[#1A8C6A] hover:underline">
                    צפה
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {user.recentListings && user.recentListings.length > 0 && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <div className="mb-2">
            <h2 className="font-sans text-[15px] font-black text-black">מודעות אחרונות</h2>
          </div>
          <div>
            <ul className="space-y-2 text-sm">
              {user.recentListings.map((l: { id: string; title: string; status: string }) => (
                <li key={l.id} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-black/10 pb-2 last:border-0">
                  <span>{l.title} · {l.status}</span>
                  <Link href={`/listing/${l.id}`} className="text-[#1A8C6A] hover:underline">
                    צפה
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {user.disputesOpenedCount > 0 && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <div className="mb-2">
            <h2 className="font-sans text-[15px] font-black text-black">מחלוקות</h2>
          </div>
          <div>
            <p className="text-sm text-[#888888]">
              משתמש פתח {user.disputesOpenedCount} מחלוקות. צפה ב
              <Link href="/admin/disputes" className="text-[#1A8C6A] hover:underline mx-1">
                רשימת המחלוקות
              </Link>
              לסינון.
            </p>
          </div>
        </div>
      )}
      </PageContainer>
    </div>
  );
}
