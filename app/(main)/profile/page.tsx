import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/sign-out-button";
import TrustBadges from "@/components/trust-badges";
import { getUserTrustBadges } from "@/lib/trust/badges";
import { VERIFICATION_REASSURANCE } from "@/lib/copy/help-reassurance";

export const runtime = "nodejs";

type Me = {
  user?: {
    id: string;
    name: string;
    kycStatus?: string | null;
    kycRejectedReason?: string | null;
    phoneNumber?: string | null;
    isAdmin?: boolean;
    completedBookingsCount?: number;
    reviewsCount?: number;
    averageRating?: number;
  };
  id?: string;
  name?: string;
  kycStatus?: string | null;
  kycRejectedReason?: string | null;
  phoneNumber?: string | null;
  isAdmin?: boolean;
  completedBookingsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
};

async function getMe(): Promise<Me | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/me`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilePage() {
  const meData = await getMe();

  if (!meData) {
    return (
      <div className="space-y-3">
        <h1 className="page-title">פרופיל</h1>
        <p className="text-sm text-muted-foreground">לא נמצא משתמש במערכת (הרץ seed).</p>
      </div>
    );
  }

  // Handle both response formats (user object or flat)
  const me = meData.user || meData;
  const kycStatus = me.kycStatus || "PENDING";

  const trustBadges = getUserTrustBadges({
    kycStatus: me.kycStatus ?? null,
    phoneNumber: me.phoneNumber ?? null,
    completedBookingsCount: me.completedBookingsCount ?? 0,
    reviewsCount: me.reviewsCount ?? 0,
    averageRating: me.averageRating ?? 0,
  });

  return (
    <div className="space-y-4">
      <h1 className="page-title">פרופיל</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטים</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">שם</span>
            <span>{me.name}</span>
          </div>
          {trustBadges.length > 0 && (
            <div className="pt-2">
              <TrustBadges badges={trustBadges} size="default" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button className="w-full" variant="outline" asChild>
            <Link href="/owner">לוח מלווה – מודעות והזמנות</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            מודעות, בקשות והזמנות פעילות
          </p>
        </CardContent>
      </Card>

      {!me.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>אימות זהות</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              סטטוס:{" "}
              <span className={statusColor(kycStatus)}>
                {statusLabel(kycStatus)}
              </span>
            </p>

            {(kycStatus === "PENDING" || kycStatus === "IN_PROGRESS") && (
              <>
                <p className="text-xs text-muted-foreground">
                  אימות זהות נדרש ליצירת הזמנות. נעבור יחד צעד-אחר-צעד בסלפי ותעודה מזהה.
                </p>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/profile/kyc">התחל אימות</Link>
                </Button>
              </>
            )}

            {kycStatus === "SUBMITTED" && (
              <p className="text-xs text-muted-foreground">
                הבקשה שלך נשלחה לאימות. נבדוק אותה ונעדכן אותך בקרוב.
              </p>
            )}

            {kycStatus === "APPROVED" && (
              <>
                <p className="text-xs text-success font-medium">
                  ✅ אימות הזהות שלך אושר בהצלחה.
                </p>
                <p className="text-xs text-muted-foreground">
                  מאומת זהות מסייע לרוכשים לבטוח במודעות שלך.
                </p>
              </>
            )}

            {me.kycRejectedReason && (
              <p className="text-xs text-destructive">
                סיבת דחייה: {me.kycRejectedReason}
              </p>
            )}
            <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
              {VERIFICATION_REASSURANCE.short}{" "}
              <Link href={VERIFICATION_REASSURANCE.learnMoreHref} className="text-primary font-medium hover:underline">
                {VERIFICATION_REASSURANCE.learnMoreLabel}
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {me.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>ניהול</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/metrics">מדדים</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/users">משתמשים</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/kyc">ביקורת אימות זהות</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Button className="w-full" variant="outline" disabled>
          הגדרות (בקרוב)
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}

function statusLabel(s: string) {
  if (s === "APPROVED") return "מאומת";
  if (s === "REJECTED") return "נדחה";
  if (s === "SUBMITTED") return "נשלח לאימות";
  if (s === "IN_PROGRESS") return "בתהליך";
  return "ממתין";
}

function statusColor(s: string) {
  if (s === "APPROVED") return "text-green-600 font-medium";
  if (s === "REJECTED") return "text-red-600 font-medium";
  return "text-yellow-700 font-medium";
}
