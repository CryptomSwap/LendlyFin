import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getBookingStatusLabelDetail, getBookingStatusPillVariant } from "@/lib/status-labels";

export type BookingCardProps = {
  title: string;
  subtitle: string;
  /** Raw booking status (e.g. REQUESTED) for label and pill variant */
  status: "REQUESTED" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "DISPUTE";
  href: string;
  /** Optional booking ref for display (e.g. LND-XXXXXX) */
  bookingRef?: string | null;
};

export default function BookingCard({ title, subtitle, status, href, bookingRef }: BookingCardProps) {
  const statusLabel = getBookingStatusLabelDetail(status);
  const pillVariant = getBookingStatusPillVariant(status);

  return (
    <Link href={href} className="block" dir="rtl">
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{title}</CardTitle>
            <StatusPill variant={pillVariant}>{statusLabel}</StatusPill>
          </div>
          {bookingRef && (
            <p className="font-mono text-xs text-muted-foreground mt-0.5" dir="ltr">
              {bookingRef}
            </p>
          )}
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground pt-0">
          <p>{subtitle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
