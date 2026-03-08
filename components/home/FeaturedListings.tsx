import Link from "next/link";
import ListingCard from "@/components/listing-card";
import { getListingTrustBadges } from "@/lib/trust/badges";
import type { FeaturedListingItem } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronLeft } from "lucide-react";

interface FeaturedListingsProps {
  listings: FeaturedListingItem[];
}

/**
 * Homepage featured listings: grid of ListingCards + "see all" link.
 * Responsive: 1–2 cols mobile, 2–3 cols desktop.
 */
export function FeaturedListings({ listings }: FeaturedListingsProps) {
  if (listings.length === 0) {
    return (
      <section className="pt-6 md:pt-3" aria-label="השכרות מומלצות">
        <h2 className="section-title mb-3 text-lg md:text-xl">השכרות אחרונות</h2>
        <EmptyState
          title="אין עדיין מודעות"
          subtitle="בקרוב יופיעו כאן השכרות. בינתיים חפשו לפי קטגוריה."
          ctaLabel="חפשו השכרות"
          ctaHref="/search"
          variant="full"
        />
      </section>
    );
  }

  return (
    <section className="pt-6 md:pt-3" aria-label="השכרות מומלצות">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="section-title text-lg md:text-xl">השכרות אחרונות</h2>
        <Link href="/search" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline md:hidden">
          כל ההשכרות
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-6">
        {listings.map((item) => (
          <ListingCard
            key={item.id}
            title={item.title}
            pricePerDay={item.pricePerDay}
            location={item.city}
            href={`/listing/${item.id}`}
            imageUrl={item.images?.[0]?.url}
            category={item.category}
            trustBadges={getListingTrustBadges({
              kycStatus: item.owner?.kycStatus ?? null,
              phoneNumber: item.owner?.phoneNumber ?? null,
              completedBookingsCount: item.completedBookingsCount ?? 0,
              reviewsCount: item.reviewsCount ?? 0,
              averageRating: item.averageRating ?? 0,
            })}
          />
        ))}
      </div>
      <div className="pt-4 text-center">
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link href="/search" className="gap-2">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            כל ההשכרות
          </Link>
        </Button>
      </div>
    </section>
  );
}
