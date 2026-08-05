export const runtime = "nodejs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer, SurfaceCard } from "@/components/layout";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import { headers } from "next/headers";
import CreateBookingCTA from "@/components/create-booking-cta";
import ListingImageCarousel from "@/components/listing-image-carousel";
import { getCategoryDisplayLabel } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { getListingStatusLabel } from "@/lib/status-labels";
import { FAQBlock } from "@/components/ui/faq-block";
import { DEPOSIT_DISPUTE_FAQ_ITEMS } from "@/lib/copy/help-reassurance";
import { Star, MessageCircle, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { mapListingImagesForApi } from "@/lib/listing-images";

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      owner: {
        select: { id: true, name: true, kycStatus: true, phoneNumber: true },
      },
    },
  });
  if (!listing) return null;

  const [completedBookingsCount, reviewsAggregate] = await Promise.all([
    prisma.booking.count({
      where: { listingId: id, status: "COMPLETED" },
    }),
    listing.ownerId
      ? prisma.review.aggregate({
          where: {
            booking: { listingId: id },
            targetUserId: listing.ownerId,
          },
          _count: { id: true },
          _avg: { rating: true },
        })
      : null,
  ]);

  return {
    ...listing,
    images: mapListingImagesForApi(listing.images, { allowInline: true }),
    completedBookingsCount,
    reviewsCount: reviewsAggregate?._count.id ?? 0,
    averageRating: Math.round((reviewsAggregate?._avg.rating ?? 0) * 10) / 10,
  } as {
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
  };
}

async function getMe(): Promise<{ id: string; isAdmin?: boolean } | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
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
        <PageContainer width="wide" className="text-center">
          <p className="font-sans font-black text-black">מודעה לא נמצאה</p>
          <p className="mt-1 font-assistant text-sm text-[#888888]">
            ייתכן שהמודעה הוסרה או שהקישור שגוי.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-block font-sans font-bold text-[#1A8C6A] hover:text-[#157A5A] hover:underline"
          >
            חזרה לחיפוש
          </Link>
        </PageContainer>
      </div>
    );
  }

  const statusLabel = getListingStatusLabel(listing.status);
  const isActive = listing.status === "ACTIVE";
  const isOwnerOrAdmin = !!me && (listing.ownerId === me.id || me.isAdmin);
  return (
    <div className="min-h-screen w-full app-page-bg pb-28" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start" aria-label="פרטי המודעה ותמחור">
          <div className="space-y-5">
            <SurfaceCard padding="sm" className="md:p-4">
              <ListingImageCarousel images={listing.images ?? []} alt={listing.title} />
            </SurfaceCard>

            {/* Main info */}
            <section aria-label="פרטי המודעה">
              <SurfaceCard padding="sm" className="space-y-2 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <RedesignStatusPill variant={statusToPillVariant(listing.status)}>
                    {statusLabel}
                  </RedesignStatusPill>
                </div>
                <h1 className="font-sans text-2xl font-black leading-tight tracking-tight text-black">
                  {listing.title}
                </h1>
                <p className="font-assistant text-sm text-[#888888]">
                  {getCategoryDisplayLabel(listing.category, listing.subcategory)}
                </p>
                {listing.status === "REJECTED" && listing.statusRejectionReason && (
                  <p className="font-assistant text-sm text-red-600">
                    סיבת דחייה: {listing.statusRejectionReason}
                  </p>
                )}
                <details className="pt-1 text-start" dir="rtl">
                  <summary className="inline-flex w-full cursor-pointer list-none items-center justify-center font-assistant text-xs text-[#1A8C6A] underline underline-offset-4 hover:text-[#157A5A]">
                    <span>למה יש פיקדון?</span>
                  </summary>
                  <div className="mt-3 space-y-4 rounded-[8px] border border-black/10 bg-white p-4 text-right font-assistant text-sm text-[#888888]">
                    <div className="space-y-2">
                      <p className="font-sans font-black text-black">למה יש פיקדון על הפריט הזה?</p>
                      <p>הפיקדון נועד לשמור על החפץ ולגרום לכולם להרגיש בנוח.</p>
                      <p>הוא מחושב אוטומטית לפי:</p>
                      <ul className="list-disc space-y-1 ps-5">
                        <li>סוג הפריט</li>
                        <li>הערך שלו</li>
                        <li>זמן ההשכרה</li>
                      </ul>
                      <p>אם הכל חוזר תקין, הפיקדון משתחרר אליך בסוף ההשכרה.</p>
                    </div>

                    <div className="h-px w-full bg-black/10" aria-hidden />

                    <div className="space-y-2">
                      <p className="font-sans font-black text-black">איך אנחנו שומרים על החפץ שלך?</p>
                      <p>כשמישהו שוכר את הפריט שלך, לנדלי מחזיקה פיקדון.</p>
                      <p>הפיקדון מחושב לפי סוג הפריט, הערך שלו והזמן שהוא מושכר.</p>
                      <p>ככה אם משהו קורה, יש כיסוי מספק!</p>
                      <p>ברוב המקרים הכל חוזר כמו שיצא, והפיקדון משתחרר 🙂</p>
                    </div>
                  </div>
                </details>
              </SurfaceCard>
            </section>
          </div>

          {/* Price & deposit */}
          <aside className="space-y-4 lg:sticky lg:top-24" aria-label="מחיר והפיקדון">
            <SurfaceCard className="py-6">
              <p className="text-center font-assistant text-sm font-medium text-[#888888]">
                מחיר ליום
              </p>
              <div className="mt-2 flex flex-col gap-4">
                <div className="text-center">
                  <span className="font-sans text-3xl font-black text-black">
                    {formatMoneyIls(listing.pricePerDay)}
                  </span>
                  <span className="me-1 font-assistant text-lg font-medium text-[#888888]">
                    ליום
                  </span>
                </div>
                <div className="space-y-1 border-t border-[#1A8C6A]/15 pt-4 text-center font-assistant text-sm">
                  <p className="text-[#888888]">
                    פיקדון מוחזר:{" "}
                    <span className="font-sans font-black text-black">
                      {formatMoneyIls(listing.deposit)}
                    </span>
                  </p>
                  <p className="text-xs text-[#888888]">
                    הפיקדון יוחזר בסיום ההשכרה אם הפריט מוחזר תקין
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </aside>
        </section>

      {/* Description */}
      {listing.description && (
        <section className="mb-6" aria-label="תיאור">
          <h2 className="section-title mb-2">תיאור</h2>
          <p className="whitespace-pre-wrap font-assistant text-sm leading-relaxed text-[#888888]">
            {listing.description}
          </p>
        </section>
      )}

      {/* Pickup / logistics */}
      <section className="mb-6" aria-label="איסוף וזמינות">
        <SurfaceCard padding="sm">
          <h2 className="font-sans text-base font-black text-black">איסוף וזמינות</h2>
          <div className="pt-2 font-assistant text-sm text-[#888888]">
            {listing.pickupNote ? (
              <p className="whitespace-pre-wrap">{listing.pickupNote}</p>
            ) : (
              <p>זמינות משתנה · איסוף עצמי</p>
            )}
          </div>
        </SurfaceCard>
      </section>

      {/* Rules */}
      {listing.rules && (
        <section className="mb-6" aria-label="כללים">
          <SurfaceCard padding="sm">
            <h2 className="font-sans text-base font-black text-black">כללים</h2>
            <div className="whitespace-pre-wrap pt-2 font-assistant text-sm text-[#888888]">
              {listing.rules}
            </div>
          </SurfaceCard>
        </section>
      )}

      {/* Liability */}
      <section className="mb-6" aria-label="אחריות">
        <SurfaceCard padding="sm">
          <h2 className="font-sans text-base font-black text-black">אחריות</h2>
          <div className="pt-2 font-assistant text-sm text-[#888888]">
            <p>אחריות השוכר מוגבלת לערך הפריט.</p>
          </div>
        </SurfaceCard>
      </section>

      {/* FAQ / help — renting, deposit, payment */}
      <section className="mb-6" aria-label="מידע על השכרה">
        <SurfaceCard padding="sm">
          <h2 className="inline-flex items-center gap-2 font-sans text-base font-black text-black">
            <HelpCircle className="h-4 w-4 text-[#888888]" aria-hidden />
            רוצה לדעת יותר?
          </h2>
          <div className="space-y-2 pt-3 font-assistant text-sm text-[#888888]">
            <p>
              בוחרים תאריכים, משלמים בכרטיס אשראי אחרי יצירת ההזמנה, וההזמנה מאושרת אוטומטית. פיקדון מוחזר בהתאם למצב הפריט.
            </p>
            <Link
              href="/help/faq"
              className="inline-flex items-center gap-1 font-sans font-bold text-[#1A8C6A] hover:text-[#157A5A] hover:underline"
            >
              שאלות נפוצות והנחיות
            </Link>
          </div>
        </SurfaceCard>
        <FAQBlock
          title="פיקדון ומחלוקות"
          items={DEPOSIT_DISPUTE_FAQ_ITEMS}
          moreLink={{ href: "/help/faq", label: "כל השאלות" }}
          className="mt-4 rounded-[8px] border border-black/10 bg-white shadow-none"
        />
      </section>

      {/* Lender / trust */}
      <section className="mb-6" aria-label="המלווה">
        <SurfaceCard padding="sm">
          <h2 className="font-sans text-base font-black text-black">המלווה</h2>
          <div className="flex flex-col gap-3 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-sans font-black text-black">
                {listing.owner?.name ?? "—"}
              </p>
              <Link
                href="/bookings"
                className="mr-auto inline-flex items-center gap-1 font-assistant text-sm text-[#1A8C6A] hover:text-[#157A5A] hover:underline"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                שאל שאלה / הודעות
              </Link>
            </div>
            <p className="inline-flex flex-wrap items-center gap-1.5 font-assistant text-sm text-[#888888]">
              {(listing.reviewsCount ?? 0) > 0 ? (
                <>
                  <Star className="h-4 w-4 shrink-0 fill-[#1A8C6A] text-[#1A8C6A]" aria-hidden />
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
            <p className="mt-2 border-t border-black/10 pt-2 font-assistant text-xs text-[#888888]">
              הפיקדון יוחזר בהתאם למצב הפריט. תמיכה זמינה.
            </p>
          </div>
        </SurfaceCard>
      </section>

      {/* Owner/admin: manage availability */}
      {isOwnerOrAdmin && (
        <section className="mb-6">
          <SurfaceCard padding="sm">
            <Link href={`/listing/${listing.id}/manage`} className="block">
              <Button
                variant="outline"
                className="w-full justify-center rounded-full border-black/15 bg-white text-black hover:border-[#1A8C6A] hover:bg-[#1A8C6A]/5 hover:text-[#1A8C6A]"
              >
                ניהול זמינות
              </Button>
            </Link>
            <p className="mt-2 text-center font-assistant text-xs text-[#888888]">
              ניהול תאריכים חסומים (מתי הפריט לא זמין להשכרה).
            </p>
          </SurfaceCard>
        </section>
      )}

      {/* Booking CTA — only when listing is active */}
      {isActive && (
        <section className="mt-8" aria-label="הזמנה">
          <h2 className="section-title mb-2">הזמנה</h2>
          <p className="mb-2 font-assistant text-sm text-[#888888]">
            בחרו תאריכים כדי לראות זמינות ולהמשיך להזמנה.
          </p>
          <p className="mb-4 font-assistant text-xs text-[#888888]">
            בחירת תאריכים אינה מחייבת — התשלום רק אחרי יצירת ההזמנה.
          </p>
          <CreateBookingCTA listingId={listing.id} />
        </section>
      )}

      {!isActive && listing.status === "PENDING_APPROVAL" && (
        <p className="py-4 text-center font-assistant text-sm text-[#888888]">
          המודעה ממתינה לאישור. אחרי האישור תוכלו להזמין.
        </p>
      )}
      </PageContainer>
    </div>
  );
}
