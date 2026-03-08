import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { needsOnboarding } from "@/lib/auth/onboarding";
import {
  QA_LISTING_IDS,
  QA_BOOKING_IDS,
  QA_DISPUTE_IDS,
  QA_LISTING_LABELS,
  QA_BOOKING_LABELS,
} from "@/lib/dev/qa-scenarios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import QAPersonaSwitcher from "@/components/dev/qa-persona-switcher";

export const dynamic = "force-dynamic";

/** Dev-only: QA page is only available when DEV_AUTH_BYPASS=true. */
function ensureDevMode() {
  if (process.env.DEV_AUTH_BYPASS !== "true") {
    notFound();
  }
}

export default async function DevQAPage() {
  ensureDevMode();

  const user = await getCurrentUser();
  let listingsCount: number | null = null;
  let bookingsCount: number | null = null;
  if (user?.id) {
    const [listings, bookings] = await Promise.all([
      prisma.listing.count({ where: { ownerId: user.id } }),
      prisma.booking.count({ where: { userId: user.id } }),
    ]);
    listingsCount = listings;
    bookingsCount = bookings;
  }

  const onboardingComplete = user ? !needsOnboarding(user) : null;

  return (
    <div className="space-y-6 pb-8" dir="rtl">
      <div>
        <h1 className="text-xl font-bold">מרכז QA – Dev</h1>
        <p className="text-sm text-muted-foreground mt-1">
          גישה מהירה לזרימות, Personas ותרחישי seed. לשימוש מקומי בלבד.
        </p>
      </div>

      {/* Current session summary */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">סשן נוכחי</h2>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          {user ? (
            <>
              <p>
                <span className="font-medium">{user.name ?? "—"}</span>
                {user.email && (
                  <span className="text-muted-foreground"> · {user.email}</span>
                )}
              </p>
              <p className="text-muted-foreground">
                id: <code className="text-xs bg-muted px-1 rounded">{user.id}</code>
                {user.isAdmin && (
                  <StatusPill variant="primary" className="mr-2">
                    Admin
                  </StatusPill>
                )}
              </p>
              <p>
                onboarding:{" "}
                {onboardingComplete === true ? (
                  <StatusPill variant="success">complete</StatusPill>
                ) : onboardingComplete === false ? (
                  <StatusPill variant="warning">נדרש</StatusPill>
                ) : (
                  "—"
                )}
                {" · "}
                KYC:{" "}
                <span className="text-muted-foreground">
                  {user.kycStatus ?? "—"}
                </span>
              </p>
              {(listingsCount !== null || bookingsCount !== null) && (
                <p className="text-muted-foreground">
                  מודעות: {listingsCount ?? 0} · הזמנות (כשוכר): {bookingsCount ?? 0}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">אין משתמש מחובר (בדוק DEV_USER_ID / cookie).</p>
          )}
        </CardContent>
      </Card>

      {/* Reset QA state (CLI only) */}
      <Card className="border-muted bg-muted/20">
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">איפוס סביבת QA</h2>
          <p className="text-xs text-muted-foreground">
            איפוס מתבצע מהטרמינל בלבד. הרץ את הפקודה למטה כדי למחוק את ה-DB הנוכחי ולשחזר את מצב ה-seed הדטרמיניסטי.
          </p>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-mono text-xs bg-background border border-border rounded px-2 py-1.5 w-fit">
            npm run qa:reset
          </p>
          <p className="text-muted-foreground text-xs">
            (אותו דבר: <code className="bg-muted px-1 rounded">npm run db:seed</code>). אחרי האיפוס רענן את הדף אם צריך.
          </p>
        </CardContent>
      </Card>

      {/* Persona switcher */}
      <QAPersonaSwitcher />

      {/* Scenario overview */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">תרחישי Seed</h2>
          <p className="text-xs text-muted-foreground">
            רשימות והזמנות עם IDs קבועים – לשימוש ב־QA ובקישורים למטה.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">הזמנות</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li>
                <Link href={`/bookings/${QA_BOOKING_IDS.REQUESTED}`} className="text-primary hover:underline">
                  {QA_BOOKING_IDS.REQUESTED}
                </Link>
                {" → "}
                {QA_BOOKING_LABELS[QA_BOOKING_IDS.REQUESTED]}
              </li>
              <li>
                <Link href={`/bookings/${QA_BOOKING_IDS.CONFIRMED}`} className="text-primary hover:underline">
                  {QA_BOOKING_IDS.CONFIRMED}
                </Link>
                {" → "}
                {QA_BOOKING_LABELS[QA_BOOKING_IDS.CONFIRMED]}
              </li>
              <li>
                <Link href={`/bookings/${QA_BOOKING_IDS.ACTIVE}`} className="text-primary hover:underline">
                  {QA_BOOKING_IDS.ACTIVE}
                </Link>
                {" → "}
                {QA_BOOKING_LABELS[QA_BOOKING_IDS.ACTIVE]}
              </li>
              <li>
                <Link href={`/bookings/${QA_BOOKING_IDS.COMPLETED}`} className="text-primary hover:underline">
                  {QA_BOOKING_IDS.COMPLETED}
                </Link>
                {" → "}
                {QA_BOOKING_LABELS[QA_BOOKING_IDS.COMPLETED]}
              </li>
              <li>
                <Link href={`/bookings/${QA_BOOKING_IDS.DISPUTE}`} className="text-primary hover:underline">
                  {QA_BOOKING_IDS.DISPUTE}
                </Link>
                {" → "}
                {QA_BOOKING_LABELS[QA_BOOKING_IDS.DISPUTE]}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">מודעות (דוגמאות)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li><Link href={`/listing/${QA_LISTING_IDS.SONY_CAMERA}`} className="text-primary hover:underline">{QA_LISTING_LABELS[QA_LISTING_IDS.SONY_CAMERA]}</Link></li>
              <li><Link href={`/listing/${QA_LISTING_IDS.TABLE_PENDING}`} className="text-primary hover:underline">{QA_LISTING_LABELS[QA_LISTING_IDS.TABLE_PENDING]}</Link></li>
              <li><Link href={`/listing/${QA_LISTING_IDS.CHAIR_REJECTED}`} className="text-primary hover:underline">{QA_LISTING_LABELS[QA_LISTING_IDS.CHAIR_REJECTED]}</Link></li>
              <li><Link href={`/listing/${QA_LISTING_IDS.PAUSED_SLEEPING_BAG}`} className="text-primary hover:underline">{QA_LISTING_LABELS[QA_LISTING_IDS.PAUSED_SLEEPING_BAG]}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">מחלוקת</h3>
            <p className="text-muted-foreground">
              <Link href={`/admin/disputes/${QA_DISPUTE_IDS.OPEN}`} className="text-primary hover:underline">
                dispute (seed) {QA_DISPUTE_IDS.OPEN}
              </Link>
              {" · "}
              booking: <code className="text-xs bg-muted px-1 rounded">{QA_BOOKING_IDS.DISPUTE}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deep links: Core */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">ליבת האפליקציה</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/home"><span className="text-sm text-primary hover:underline">דף הבית</span></Link>
            <Link href="/search"><span className="text-sm text-primary hover:underline">חיפוש</span></Link>
            <Link href="/add"><span className="text-sm text-primary hover:underline">הוספת מודעה</span></Link>
            <Link href="/bookings"><span className="text-sm text-primary hover:underline">הזמנות שלי</span></Link>
            <Link href="/owner"><span className="text-sm text-primary hover:underline">לוח בעלים</span></Link>
            <Link href="/profile"><span className="text-sm text-primary hover:underline">פרופיל</span></Link>
            <Link href="/profile/kyc"><span className="text-sm text-primary hover:underline">אימות זהות</span></Link>
            <Link href="/onboarding"><span className="text-sm text-primary hover:underline">Onboarding</span></Link>
          </div>
        </CardContent>
      </Card>

      {/* Deep links: Listings */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">מודעות (Seed)</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href={`/listing/${QA_LISTING_IDS.SONY_CAMERA}`} className="text-sm text-primary hover:underline">Sony (ACTIVE)</Link>
            <Link href={`/listing/${QA_LISTING_IDS.TENT}`} className="text-sm text-primary hover:underline">אוהל (ACTIVE)</Link>
            <Link href={`/listing/${QA_LISTING_IDS.TABLE_PENDING}`} className="text-sm text-primary hover:underline">שולחן (PENDING_APPROVAL)</Link>
            <Link href={`/listing/${QA_LISTING_IDS.CHAIR_REJECTED}`} className="text-sm text-primary hover:underline">כיסא (REJECTED)</Link>
            <Link href={`/listing/${QA_LISTING_IDS.PAUSED_SLEEPING_BAG}`} className="text-sm text-primary hover:underline">שק שינה (PAUSED)</Link>
            <Link href={`/listing/${QA_LISTING_IDS.BIKE}/manage`} className="text-sm text-primary hover:underline">נהל אופניים (owner)</Link>
          </div>
        </CardContent>
      </Card>

      {/* Deep links: Bookings */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">הזמנות (Seed)</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">דף הזמנה · איסוף · החזרה · הודעות</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/bookings/${QA_BOOKING_IDS.REQUESTED}`} className="text-sm text-primary hover:underline">REQUESTED</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.CONFIRMED}`} className="text-sm text-primary hover:underline">CONFIRMED</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.CONFIRMED}/pickup`} className="text-sm text-primary hover:underline">CONFIRMED → איסוף</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.ACTIVE}`} className="text-sm text-primary hover:underline">ACTIVE</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.ACTIVE}/return`} className="text-sm text-primary hover:underline">ACTIVE → החזרה</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.COMPLETED}`} className="text-sm text-primary hover:underline">COMPLETED</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.COMPLETED}/messages`} className="text-sm text-primary hover:underline">COMPLETED הודעות</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.DISPUTE}`} className="text-sm text-primary hover:underline">DISPUTE</Link>
            <Link href={`/bookings/${QA_BOOKING_IDS.DISPUTE}/messages`} className="text-sm text-primary hover:underline">DISPUTE הודעות</Link>
          </div>
        </CardContent>
      </Card>

      {/* Admin */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">מנהל</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users" className="text-sm text-primary hover:underline">משתמשים</Link>
            <Link href="/admin/listings" className="text-sm text-primary hover:underline">מודעות</Link>
            <Link href="/admin/bookings" className="text-sm text-primary hover:underline">הזמנות</Link>
            <Link href="/admin/disputes" className="text-sm text-primary hover:underline">מחלוקות</Link>
            <Link href={`/admin/disputes/${QA_DISPUTE_IDS.OPEN}`} className="text-sm text-primary hover:underline">מחלוקת (seed)</Link>
            <Link href="/admin/kyc" className="text-sm text-primary hover:underline">אימות זהות</Link>
            <Link href="/admin/metrics" className="text-sm text-primary hover:underline">מדדים</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
