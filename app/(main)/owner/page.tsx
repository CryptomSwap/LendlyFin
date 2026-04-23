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
        <h1 className="section-title">לוח מלווה</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          סיכום המודעות, ההזמנות והפעולות הבאות
        </p>
        {hasListings && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.activeListingsCount} מודעות פעילות
            {data.pendingBookingRequestsCount > 0 && ` · ${data.pendingBookingRequestsCount} בקשות ממתינות`}
          </p>
        )}
      </header>

      {!hasListings ? (
        <EmptyState
          icon={<Package className="h-12 w-12 text-primary" aria-hidden />}
          title="עדיין אין לך מודעות"
          subtitle="הוסיפו מודעה ראשונה, הציעו ציוד להשכרה וקבלו הזמנות."
          ctaLabel="הוסיפו מודעה"
          ctaHref="/add"
        />
      ) : (
        <>
          <section aria-label="סיכום">
            <h2 className="text-sm font-semibold text-foreground mb-2">סיכום</h2>
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
