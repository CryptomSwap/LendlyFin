"use client";

import { useState, useMemo } from "react";
import type { ListingOverviewItem } from "@/lib/owner/dashboard";
import { StatusTabs, type ListingFilterType } from "./StatusTabs";
import OwnerListingsOverview from "./OwnerListingsOverview";
import { EmptyState } from "@/components/ui/empty-state";
import { ListFilter } from "lucide-react";

export interface OwnerListingsSectionProps {
  listings: ListingOverviewItem[];
}

function filterListings(listings: ListingOverviewItem[], filter: ListingFilterType): ListingOverviewItem[] {
  switch (filter) {
    case "all":
      return listings;
    case "active":
      return listings.filter((l) => l.status === "ACTIVE");
    case "pending":
      return listings.filter((l) => l.status === "PENDING_APPROVAL");
    case "paused":
      return listings.filter((l) => l.status === "PAUSED");
    default:
      return listings;
  }
}

function getCounts(listings: ListingOverviewItem[]): Record<ListingFilterType, number> {
  return {
    all: listings.length,
    active: listings.filter((l) => l.status === "ACTIVE").length,
    pending: listings.filter((l) => l.status === "PENDING_APPROVAL").length,
    paused: listings.filter((l) => l.status === "PAUSED").length,
  };
}

export default function OwnerListingsSection({ listings }: OwnerListingsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ListingFilterType>("all");

  const counts = useMemo(() => getCounts(listings), [listings]);
  const filteredListings = useMemo(
    () => filterListings(listings, activeFilter),
    [listings, activeFilter]
  );

  const isFilteredEmpty = filteredListings.length === 0 && activeFilter !== "all";

  return (
    <section aria-label="המודעות שלי" id="listings">
      {listings.length > 0 && (
        <StatusTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      )}
      {isFilteredEmpty ? (
        <EmptyState
          icon={<ListFilter className="h-12 w-12 text-muted-foreground" aria-hidden />}
          title="אין מודעות בסטטוס זה"
          subtitle="נסה לבחור סטטוס אחר או הצג את כל המודעות."
          ctaLabel="הצג את כל המודעות"
          onCtaClick={() => setActiveFilter("all")}
        />
      ) : (
        <OwnerListingsOverview listings={filteredListings} />
      )}
    </section>
  );
}
