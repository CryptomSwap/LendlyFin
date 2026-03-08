import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpcomingItem } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { Calendar, RotateCcw } from "lucide-react";

export interface OwnerUpcomingBookingsProps {
  upcomingPickups: UpcomingItem[];
  upcomingReturns: UpcomingItem[];
  className?: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ItemList({
  items,
  emptyMessage,
  title,
  icon: Icon,
}: {
  items: UpcomingItem[];
  emptyMessage: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((b) => (
          <li key={b.id}>
            <Link
              href={`/bookings/${b.id}`}
              className="block rounded-lg border border-border bg-card p-2.5 text-sm hover:bg-muted/30 transition-colors"
            >
              <p className="font-medium text-foreground">{b.listingTitle}</p>
              <p className="text-muted-foreground text-xs">
                {b.renterName} · {fmt(b.startDate)}
                {b.bookingRef && (
                  <span className="font-mono mr-1" dir="ltr">
                    {" "}
                    {b.bookingRef}
                  </span>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OwnerUpcomingBookings({
  upcomingPickups,
  upcomingReturns,
  className,
}: OwnerUpcomingBookingsProps) {
  return (
    <Card className={cn("shadow-soft", className)} dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">איסופים והחזרות קרובים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ItemList
          items={upcomingPickups}
          emptyMessage="אין איסופים מתוכננים"
          title="איסופים קרובים"
          icon={Calendar}
        />
        <ItemList
          items={upcomingReturns}
          emptyMessage="אין החזרות מתוכננות"
          title="החזרות קרובות"
          icon={RotateCcw}
        />
      </CardContent>
    </Card>
  );
}
