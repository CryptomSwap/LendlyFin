import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookingStatusLabel } from "@/lib/status-labels";
import type { AttentionBooking } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface OwnerAttentionListProps {
  bookings: AttentionBooking[];
  className?: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OwnerAttentionList({
  bookings,
  className,
}: OwnerAttentionListProps) {
  if (bookings.length === 0) {
    return (
      <Card className={cn("shadow-soft", className)} dir="rtl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            דורש טיפול
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">אין הזמנות שדורשות טיפול כרגע.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} id="attention" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          דורש טיפול ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((b) => (
          <Link
            key={b.id}
            href={`/bookings/${b.id}`}
            className="block rounded-lg border border-border bg-muted/30 p-3 md:p-4 text-sm hover:bg-muted/50 transition-colors"
          >
            <p className="font-medium text-foreground">{b.listingTitle}</p>
            <p className="text-muted-foreground">
              {b.renterName} · {getBookingStatusLabel(b.status)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fmt(b.startDate)} – {fmt(b.endDate)}
              {b.bookingRef && (
                <span className="font-mono mr-1" dir="ltr">
                  {" "}
                  {b.bookingRef}
                </span>
              )}
            </p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
