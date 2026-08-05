import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin";
import { getOwnerDashboardData } from "@/lib/owner/dashboard";
import OwnerStatsCards from "@/components/owner/OwnerStatsCards";
import OwnerQuickActions from "@/components/owner/OwnerQuickActions";
import OwnerAttentionList from "@/components/owner/OwnerAttentionList";
import OwnerUpcomingBookings from "@/components/owner/OwnerUpcomingBookings";
import OwnerListingsSection from "@/components/owner/OwnerListingsSection";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout";
import { Package } from "lucide-react";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin");
  }

  const data = await getOwnerDashboardData(user.id);
  const hasListings = data.listings.length > 0;

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-8">
        <header>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            לוח מלווה
          </h1>
          <p className="mt-1 font-assistant text-[14px] text-[#888888]">
            סיכום המודעות, ההזמנות והפעולות הבאות
          </p>
          {hasListings && (
            <p className="mt-1 font-assistant text-[12px] text-[#888888]">
              {data.activeListingsCount} מודעות פעילות
              {data.pendingBookingRequestsCount > 0 &&
                ` · ${data.pendingBookingRequestsCount} בקשות ממתינות`}
            </p>
          )}
        </header>

        {!hasListings ? (
          <EmptyState
            icon={<Package className="h-12 w-12 text-[#1A8C6A]" aria-hidden />}
            title="עדיין אין לך מודעות"
            subtitle="הוסיפו מודעה ראשונה, הציעו ציוד להשכרה וקבלו הזמנות."
            ctaLabel="הוסיפו מודעה"
            ctaHref="/add"
          />
        ) : (
          <>
            <section aria-label="סיכום">
              <h2 className="mb-2 font-sans text-[14px] font-black text-black">סיכום</h2>
              <OwnerStatsCards
                activeListingsCount={data.activeListingsCount}
                pendingBookingRequestsCount={data.pendingBookingRequestsCount}
                upcomingPickupsCount={data.upcomingPickupsCount}
                activeRentalsCount={data.activeRentalsCount}
                completedBookingsCount={data.completedBookingsCount}
                earningsIls={data.earningsIls}
              />
            </section>

            <section aria-label="פעולות מהירות">
              <OwnerQuickActions />
            </section>

            {data.attentionBookings.length > 0 && (
              <section aria-label="דורש טיפול">
                <OwnerAttentionList bookings={data.attentionBookings} />
              </section>
            )}

            <section aria-label="איסופים והחזרות">
              <OwnerUpcomingBookings
                upcomingPickups={data.upcomingPickups}
                upcomingReturns={data.upcomingReturns}
              />
            </section>
          </>
        )}

        {hasListings && <OwnerListingsSection listings={data.listings} />}
      </PageContainer>
    </div>
  );
}
