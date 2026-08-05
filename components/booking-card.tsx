import Link from "next/link";
import { RedesignStatusPill, type RedesignStatusVariant } from "@/components/redesign/status-pill";
import { getBookingStatusLabelDetail, getBookingStatusPillVariant } from "@/lib/status-labels";

export type BookingCardProps = {
  title: string;
  subtitle: string;
  /** Raw booking status (e.g. REQUESTED) for label and pill variant */
  status:
    | "REQUESTED"
    | "CONFIRMED"
    | "ACTIVE"
    | "RETURNED"
    | "IN_DISPUTE"
    | "NON_RETURN_PENDING"
    | "NON_RETURN_CONFIRMED"
    | "COMPLETED"
    | "DISPUTE";
  href: string;
  /** Optional booking ref for display (e.g. LND-XXXXXX) */
  bookingRef?: string | null;
};

function toRedesignVariant(
  variant: ReturnType<typeof getBookingStatusPillVariant>
): RedesignStatusVariant {
  return variant === "primary" ? "brand" : variant;
}

export default function BookingCard({ title, subtitle, status, href, bookingRef }: BookingCardProps) {
  const statusLabel = getBookingStatusLabelDetail(status);
  const pillVariant = toRedesignVariant(getBookingStatusPillVariant(status));

  return (
    <Link href={href} className="block" dir="rtl">
      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-sans text-base font-bold text-black">{title}</h2>
          <RedesignStatusPill variant={pillVariant}>{statusLabel}</RedesignStatusPill>
        </div>
        {bookingRef && (
          <p className="font-mono text-xs text-[#888888] mt-1" dir="ltr">
            {bookingRef}
          </p>
        )}
        <p className="mt-2 font-assistant text-[14px] text-[#888888]">{subtitle}</p>
      </div>
    </Link>
  );
}
