import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SignOutButton from "@/components/sign-out-button";
import ThemeToggle from "@/components/theme-toggle";
import { PageContainer, PageIntro } from "@/components/layout";
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
  const cookie = h.get("cookie") ?? "";
  const url = `${proto}://${host}/api/me`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilePage() {
  const meData = await getMe();

  if (!meData) {
    return (
      <div className="min-h-screen pb-6 md:pb-10 w-full app-page-bg" dir="rtl">
        <PageContainer noPadding>
          <PageIntro title="פרופיל" />
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>מראה</CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeToggle />
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">לא נמצא משתמש במערכת (הרץ seed).</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Handle both response formats (user object or flat)
  const me = meData.user || meData;
  const kycStatus = me.kycStatus || "PENDING";

  return (
    <div className="min-h-screen pb-6 md:pb-10 w-full app-page-bg" dir="rtl">
      <PageContainer noPadding>
        <PageIntro title="פרופיל" />
        <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>פרטים</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">שם</span>
            <span>{me.name}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>מראה</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
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
                  מאומת מסייע לרוכשים לבטוח במודעות שלך.
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
      </PageContainer>
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
  if (s === "APPROVED") return "text-success font-medium";
  if (s === "REJECTED") return "text-destructive font-medium";
  return "text-foreground font-medium";
}
