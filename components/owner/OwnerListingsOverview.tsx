import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getListingStatusLabel, getBookingStatusLabel } from "@/lib/status-labels";
import type { ListingOverviewItem } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { Package, Calendar } from "lucide-react";
import { formatMoneyIls } from "@/lib/pricing";

export interface OwnerListingsOverviewProps {
  listings: ListingOverviewItem[];
  className?: string;
}

export default function OwnerListingsOverview({
  listings,
  className,
}: OwnerListingsOverviewProps) {
  if (listings.length === 0) {
    return (
      <Card className={cn("shadow-soft", className)} dir="rtl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">המודעות שלי</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            עדיין אין לך מודעות. הוסף מודעה ראשונה והתחל להרוויח מהציוד שלך.
          </p>
          <Link href="/add">
            <Button className="w-full gap-2">
              <Package className="h-4 w-4" />
              הוסף מודעה
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-soft", className)} dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">המודעות שלי</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {listings.map((l) => (
          <div
            key={l.id}
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-lg border border-border bg-card p-3 md:p-4"
          >
            <div className="min-w-0 flex flex-1 items-start gap-3">
              <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
                {l.imageUrl ? (
                  <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                    אין תמונה
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {l.city} · {formatMoneyIls(l.pricePerDay)} / יום
                </p>
                <p className="text-xs text-muted-foreground">
                  {getListingStatusLabel(l.status)}
                  {l.bookingsCount > 0 && ` · ${l.bookingsCount} הזמנות`}
                </p>
                {l.latestBookingStatus && (
                  <p className="text-xs text-muted-foreground">
                    הזמנה אחרונה: {getBookingStatusLabel(l.latestBookingStatus)}
                    {l.latestBookingRef ? (
                      <span className="font-mono mr-1" dir="ltr">
                        {l.latestBookingRef}
                      </span>
                    ) : null}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/listing/${l.id}`}>
                <Button variant="ghost" size="sm">
                  צפה
                </Button>
              </Link>
              <Link href={`/listing/${l.id}/manage`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar className="h-3.5 w-3" />
                  זמינות
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
