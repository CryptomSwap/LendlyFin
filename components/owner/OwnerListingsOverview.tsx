import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getListingStatusLabel } from "@/lib/status-labels";
import type { ListingOverviewItem } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { Package, Calendar } from "lucide-react";

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
      <CardContent className="space-y-2">
        {listings.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{l.title}</p>
              <p className="text-xs text-muted-foreground">
                {getListingStatusLabel(l.status)}
                {l.bookingsCount > 0 && ` · ${l.bookingsCount} הזמנות`}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
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
