import Link from "next/link";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";
import {
  getListingStatusLabel,
  getBookingStatusLabel,
  getListingStatusPillVariant,
} from "@/lib/status-labels";
import type { ListingOverviewItem } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { Package, Calendar } from "lucide-react";
import { formatMoneyIls } from "@/lib/pricing";

export interface OwnerListingsOverviewProps {
  listings: ListingOverviewItem[];
  className?: string;
}

function toRedesignVariant(
  variant: ReturnType<typeof getListingStatusPillVariant>
): RedesignStatusVariant {
  return variant === "primary" ? "brand" : variant;
}

export default function OwnerListingsOverview({
  listings,
  className,
}: OwnerListingsOverviewProps) {
  if (listings.length === 0) {
    return (
      <div
        className={cn("rounded-[8px] border border-black/10 bg-white p-5", className)}
        dir="rtl"
      >
        <h2 className="mb-3 font-sans text-[16px] font-black text-black">המודעות שלי</h2>
        <p className="mb-4 font-assistant text-[14px] text-[#888888]">
          עדיין אין לך מודעות. הוסף מודעה ראשונה והתחל להרוויח מהציוד שלך.
        </p>
        <Link
          href="/add"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-[#157A5A]"
        >
          <Package className="h-4 w-4" />
          הוסף מודעה
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-[8px] border border-black/10 bg-white p-5", className)}
      dir="rtl"
    >
      <h2 className="mb-3 font-sans text-[16px] font-black text-black">המודעות שלי</h2>
      <div className="space-y-3">
        {listings.map((l) => (
          <div
            key={l.id}
            className="flex flex-col gap-3 rounded-[8px] border border-black/10 bg-white p-3 md:flex-row md:items-center md:justify-between md:p-4"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[8px] border border-black/10 bg-black/[0.03]">
                {l.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-assistant text-[11px] text-[#888888]">
                    אין תמונה
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-sans text-[14px] font-bold text-black">{l.title}</p>
                  <RedesignStatusPill variant={toRedesignVariant(getListingStatusPillVariant(l.status))}>
                    {getListingStatusLabel(l.status)}
                  </RedesignStatusPill>
                </div>
                <p className="font-assistant text-[12px] text-[#888888]">
                  {l.city} · {formatMoneyIls(l.pricePerDay)} / יום
                </p>
                <p className="font-assistant text-[12px] text-[#888888]">
                  {l.bookingsCount > 0 && `${l.bookingsCount} הזמנות`}
                </p>
                {l.latestBookingStatus && (
                  <p className="font-assistant text-[12px] text-[#888888]">
                    הזמנה אחרונה: {getBookingStatusLabel(l.latestBookingStatus)}
                    {l.latestBookingRef ? (
                      <span className="mr-1 font-mono" dir="ltr">
                        {l.latestBookingRef}
                      </span>
                    ) : null}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/listing/${l.id}`}
                className="rounded-full px-4 py-1.5 font-sans text-[13px] font-bold text-[#1A8C6A] transition-colors hover:bg-[#1A8C6A]/8"
              >
                צפה
              </Link>
              <Link
                href={`/listing/${l.id}/manage`}
                className="inline-flex items-center gap-1 rounded-full border border-black/15 bg-white px-4 py-1.5 font-sans text-[13px] font-bold text-black transition-colors hover:bg-black/5"
              >
                <Calendar className="h-3.5 w-3" />
                זמינות
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
