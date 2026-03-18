export const runtime = "nodejs";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout";
import { StatusPill } from "@/components/ui/status-pill";
import { headers } from "next/headers";
import CreateBookingCTA from "@/components/create-booking-cta";
import ListingImageCarousel from "@/components/listing-image-carousel";
import { getCategoryDisplayLabel } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { getListingStatusLabel } from "@/lib/status-labels";
import { getListingTrustBadges } from "@/lib/trust/badges";
import TrustBadges from "@/components/trust-badges";
import { FAQBlock } from "@/components/ui/faq-block";
import { DEPOSIT_DISPUTE_FAQ_ITEMS } from "@/lib/copy/help-reassurance";
import { Star, CheckCircle2, MessageCircle, HelpCircle } from "lucide-react";

async function getListing(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/listings/${id}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  return res.json() as Promise<{
    id: string;
    ownerId?: string | null;
    owner?: { id: string; name: string; kycStatus?: string | null; phoneNumber?: string | null } | null;
    title: string;
    description?: string | null;
    pricePerDay: number;
    deposit: number;
    category: string;
    subcategory?: string | null;
    status: string;
    statusRejectionReason?: string | null;
    valueEstimate?: number | null;
    pickupNote?: string | null;
    rules?: string | null;
    images: { url: string; order: number }[];
    completedBookingsCount?: number;
    reviewsCount?: number;
    averageRating?: number;
  }>;
}

async function getMe(): Promise<{ id: string; isAdmin?: boolean } | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/me`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const user = data.user ?? data;
  return user?.id ? { id: user.id, isAdmin: !!user.isAdmin } : null;
}


function statusToPillVariant(status: string): "success" | "warning" | "danger" | "muted" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING_APPROVAL":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "muted";
  }
}

export default async function ListingDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [listing, me] = await Promise.all([
    getListing(id),
    getMe(),
  ]);

  if (!listing) {
    return (
      <div className="min-h-screen w-full app-page-bg py-16" dir="rtl">
        <div className="w-full max-w-md md:max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-foreground font-medium">מודעה לא נמצאה</p>
          <p className="text-sm text-muted-foreground mt-1">ייתכן שהמודעה הוסרה או שהקישור שגוי.</p>
          <Link href="/search" className="inline-block mt-6 text-primary font-medium hover:underline">
            חזרה לחיפוש
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = getListingStatusLabel(listing.status);
  const isActive = listing.status === "ACTIVE";
  const isOwnerOrAdmin = !!me && (listing.ownerId === me.id || me.isAdmin);

  return (
    <div className="min-h-screen w-full app-page-bg pb-28" dir="rtl">
      {/* Hero media — gallery with nav and dots (full-bleed) */}
      <section className="-mx-4 mb-6" aria-label="גלריית תמונות">
        <ListingImageCarousel images={listing.images ?? []} alt={listing.title} />
      </section>

      <PageContainer noPadding>
        {/* Main info — title, status, category */}
        <section className="space-y-2 mb-6" aria-label="פרטי המודעה">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill variant={statusToPillVariant(listing.status)}>
            {statusLabel}
          </StatusPill>
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
          {listing.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {getCategoryDisplayLabel(listing.category, listing.subcategory)}
        </p>
        {listing.status === "REJECTED" && listing.statusRejectionReason && (
          <p className="text-sm text-destructive">
            סיבת דחייה: {listing.statusRejectionReason}
          </p>
        )}
      </section>

      {/* Price & deposit — premium block */}
      <section className="mb-6" aria-label="מחיר והפיקדון">
        <Card variant="priceBox" className="py-6">
          <CardHeader className="py-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground text-center">
              מחיר ליום
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col gap-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">
                {formatMoneyIls(listing.pricePerDay)}
              </span>
              <span className="text-lg font-medium text-muted-foreground me-1">
                ליום
              </span>
            </div>
            <div className="border-t border-primary/10 pt-4 space-y-1 text-center text-sm">
              <p className="text-muted-foreground">
                פיקדון מוחזר: <span className="font-semibold text-foreground">{formatMoneyIls(listing.deposit)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                הפיקדון יוחזר בסיום ההשכרה אם הפריט מוחזר תקין
              </p>
              <details className="pt-1 text-start" dir="rtl">
                <summary className="text-xs text-primary underline underline-offset-4 cursor-pointer inline-flex items-center justify-center w-full list-none">
                  <span>למה יש פיקדון?</span>
                </summary>
                <div className="mt-3 rounded-xl border border-border/70 bg-card/70 p-4 text-sm text-muted-foreground space-y-4 text-right">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">למה יש פיקדון על הפריט הזה?</p>
                    <p>הפיקדון נועד לשמור על החפץ ולגרום לכולם להרגיש בנוח.</p>
                    <p>הוא מחושב אוטומטית לפי:</p>
                    <ul className="list-disc ps-5 space-y-1">
                      <li>סוג הפריט</li>
                      <li>הערך שלו</li>
                      <li>זמן ההשכרה</li>
                    </ul>
                    <p>אם הכל חוזר תקין, הפיקדון משתחרר אליך בסוף ההשכרה.</p>
                  </div>

                  <div className="h-px w-full bg-border/70" aria-hidden />

                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">איך אנחנו שומרים על החפץ שלך?</p>
                    <p>כשמישהו שוכר את הפריט שלך, לנדלי מחזיקה פיקדון.</p>
                    <p>הפיקדון מחושב לפי סוג הפריט, הערך שלו והזמן שהוא מושכר.</p>
                    <p>ככה אם משהו קורה, יש כיסוי מספק!</p>
                    <p>ברוב המקרים הכל חוזר כמו שיצא, והפיקדון משתחרר 🙂</p>
                  </div>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Description */}
      {listing.description && (
        <section className="mb-6" aria-label="תיאור">
          <h2 className="section-title mb-2">תיאור</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {listing.description}
          </p>
        </section>
      )}

      {/* Pickup / logistics */}
      <section className="mb-6" aria-label="איסוף וזמינות">
        <Card variant="elevated" className="py-4">
          <CardHeader className="py-0">
            <CardTitle className="text-base">איסוף וזמינות</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-sm text-muted-foreground">
            {listing.pickupNote ? (
              <p className="whitespace-pre-wrap">{listing.pickupNote}</p>
            ) : (
              <p>זמינות משתנה · איסוף עצמי</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Rules */}
      {listing.rules && (
        <section className="mb-6" aria-label="כללים">
          <Card variant="elevated" className="py-4">
            <CardHeader className="py-0">
              <CardTitle className="text-base">כללים</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {listing.rules}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Liability */}
      <section className="mb-6" aria-label="אחריות">
        <Card className="py-4">
          <CardHeader className="py-0">
            <CardTitle className="text-base">אחריות</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-sm text-muted-foreground">
            <p>אחריות השוכר מוגבלת לערך הפריט.</p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ / help — renting, deposit, payment */}
      <section className="mb-6" aria-label="מידע על השכרה">
        <Card className="py-4">
          <CardHeader className="py-0">
            <CardTitle className="text-base inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
              רוצה לדעת יותר?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 text-sm text-muted-foreground space-y-2">
            <p>בוחרים תאריכים, משלמים ב-Bit אחרי יצירת ההזמנה, והצוות מאמת. פיקדון מוחזר בהתאם למצב הפריט.</p>
            <Link href="/help/faq" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">
              שאלות נפוצות והנחיות
            </Link>
          </CardContent>
        </Card>
        <FAQBlock
          title="פיקדון ומחלוקות"
          items={DEPOSIT_DISPUTE_FAQ_ITEMS}
          moreLink={{ href: "/help/faq", label: "כל השאלות" }}
          className="mt-4"
        />
      </section>

      {/* Lender / trust */}
      <section className="mb-6" aria-label="המלווה">
        <Card variant="elevated" className="py-4">
          <CardHeader className="py-0">
            <CardTitle className="text-base">המלווה</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground">
                {listing.owner?.name ?? "—"}
              </p>
              {listing.owner?.kycStatus === "APPROVED" && (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium" aria-label="מאומת">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  מאומת
                </span>
              )}
              <Link href="/bookings" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mr-auto">
                <MessageCircle className="h-4 w-4" aria-hidden />
                שאל שאלה / הודעות
              </Link>
            </div>
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5 flex-wrap">
              {(listing.reviewsCount ?? 0) > 0 ? (
                <>
                  <Star className="h-4 w-4 fill-primary text-primary shrink-0" aria-hidden />
                  <span>{(listing.averageRating ?? 0).toFixed(1)}</span>
                  <span>·</span>
                  <span>{listing.reviewsCount} ביקורות</span>
                  {(listing.completedBookingsCount ?? 0) > 0 && (
                    <>
                      <span>·</span>
                      <span>{listing.completedBookingsCount} השכרות הושלמו</span>
                    </>
                  )}
                </>
              ) : (listing.completedBookingsCount ?? 0) > 0 ? (
                <span>{listing.completedBookingsCount} השכרות הושלמו</span>
              ) : (
                <span>אין ביקורות עדיין</span>
              )}
            </p>
            {(() => {
              const badges = getListingTrustBadges({
                kycStatus: listing.owner?.kycStatus ?? null,
                phoneNumber: listing.owner?.phoneNumber ?? null,
                completedBookingsCount: listing.completedBookingsCount ?? 0,
                reviewsCount: listing.reviewsCount ?? 0,
                averageRating: listing.averageRating ?? 0,
              });
              return badges.length > 0 ? (
                <TrustBadges badges={badges} size="default" />
              ) : null;
            })()}
            <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
              הפיקדון יוחזר בהתאם למצב הפריט. תמיכה זמינה.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Owner/admin: manage availability */}
      {isOwnerOrAdmin && (
        <section className="mb-6">
          <Card className="py-4">
            <CardContent className="pt-0">
              <Link href={`/listing/${listing.id}/manage`} className="block">
                <Button variant="outline" className="w-full justify-center">
                  ניהול זמינות
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ניהול תאריכים חסומים (מתי הפריט לא זמין להשכרה).
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Booking CTA — only when listing is active */}
      {isActive && (
        <section className="mt-8" aria-label="הזמנה">
          <h2 className="section-title mb-2">הזמנה</h2>
          <p className="text-sm text-muted-foreground mb-2">
            בחרו תאריכים כדי לראות זמינות ולהמשיך להזמנה.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            בחירת תאריכים אינה מחייבת — התשלום רק אחרי יצירת ההזמנה.
          </p>
          <CreateBookingCTA listingId={listing.id} />
        </section>
      )}

      {!isActive && listing.status === "PENDING_APPROVAL" && (
        <p className="text-sm text-muted-foreground text-center py-4">
          המודעה ממתינה לאישור. אחרי האישור תוכלו להזמין.
        </p>
      )}
      </PageContainer>
    </div>
  );
}
