export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingStatusLabel } from "@/lib/status-labels";
import { SuspendActions } from "./suspend-actions";
import { PageContainer } from "@/components/layout";

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
        <Link href="/admin/users" className="text-primary underline mt-2 inline-block">
          חזרה לרשימת משתמשים
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה למשתמשים
        </Link>
      </div>

      <h1 className="page-title">משתמש – {user.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטים</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><span className="font-medium">מזהה:</span> {user.id}</p>
          <p><span className="font-medium">שם:</span> {user.name}</p>
          <p><span className="font-medium">מנהל:</span> {user.isAdmin ? "כן" : "לא"}</p>
          <p><span className="font-medium">אימות זהות:</span> {KYC_LABELS[user.kycStatus ?? ""] ?? user.kycStatus ?? "—"}</p>
          {user.kycSubmittedAt && (
            <p><span className="font-medium">נשלח לאימות:</span> {new Date(user.kycSubmittedAt).toLocaleString("he-IL")}</p>
          )}
          {user.kycRejectedReason && (
            <p><span className="font-medium">סיבת דחייה:</span> {user.kycRejectedReason}</p>
          )}
          <p>
            <span className="font-medium">מושעה:</span>{" "}
            {user.suspendedAt ? (
              <>כן · {new Date(user.suspendedAt).toLocaleString("he-IL")}{user.suspensionReason ? ` · ${user.suspensionReason}` : ""}</>
            ) : (
              "לא"
            )}
          </p>
          {user.createdAt && (
            <p><span className="font-medium">נרשם:</span> {new Date(user.createdAt).toLocaleString("he-IL")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פעולות</CardTitle>
        </CardHeader>
        <CardContent>
          <SuspendActions
            userId={user.id}
            suspended={!!user.suspendedAt}
          />
          <div className="mt-4">
            <Link href={`/admin/kyc?userId=${user.id}`} className="text-sm text-primary hover:underline">
              ביקורת אימות זהות
            </Link>
            {" · "}
            <Link href={`/admin/bookings?userId=${user.id}`} className="text-sm text-primary hover:underline">
              הזמנות של משתמש
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><span className="font-medium">הזמנות:</span> {user.bookingsCount}</p>
          <p><span className="font-medium">מחלוקות שנפתחו על ידי משתמש:</span> {user.disputesOpenedCount}</p>
          <p><span className="font-medium">מודעות:</span> {user.listingsCount}</p>
        </CardContent>
      </Card>

      {user.recentBookings && user.recentBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>הזמנות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {user.recentBookings.map((b: { id: string; status: string; listingTitle: string; startDate: string; endDate: string }) => (
                <li key={b.id} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-2 last:border-0">
                  <span>{b.listingTitle} · {getBookingStatusLabel(b.status)}</span>
                  <Link href={`/admin/bookings/${b.id}`} className="text-primary hover:underline">
                    צפה
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {user.recentListings && user.recentListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>מודעות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {user.recentListings.map((l: { id: string; title: string; status: string }) => (
                <li key={l.id} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-2 last:border-0">
                  <span>{l.title} · {l.status}</span>
                  <Link href={`/listing/${l.id}`} className="text-primary hover:underline">
                    צפה
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {user.disputesOpenedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>מחלוקות</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              משתמש פתח {user.disputesOpenedCount} מחלוקות. צפה ב
              <Link href="/admin/disputes" className="text-primary hover:underline mx-1">
                רשימת המחלוקות
              </Link>
              לסינון.
            </p>
          </CardContent>
        </Card>
      )}
      </PageContainer>
    </div>
  );
}
