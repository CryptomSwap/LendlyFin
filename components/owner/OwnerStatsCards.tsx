import { Card, CardContent } from "@/components/ui/card";
import { formatMoneyIls } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Package, Clock, CalendarCheck, Car, CheckCircle, Banknote } from "lucide-react";

export interface OwnerStatsCardsProps {
  activeListingsCount: number;
  pendingBookingRequestsCount: number;
  upcomingPickupsCount: number;
  activeRentalsCount: number;
  completedBookingsCount: number;
  earningsIls: number;
  className?: string;
}

const statCard = (
  icon: React.ReactNode,
  label: string,
  value: string | number,
  className?: string
) => (
  <Card key={label} className={cn("py-3 shadow-soft", className)}>
    <CardContent className="flex items-center gap-3 p-4 md:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground tabular-nums">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default function OwnerStatsCards({
  activeListingsCount,
  pendingBookingRequestsCount,
  upcomingPickupsCount,
  activeRentalsCount,
  completedBookingsCount,
  earningsIls,
  className,
}: OwnerStatsCardsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4", className)} dir="rtl">
      {statCard(
        <Package className="h-5 w-5" />,
        "מודעות פעילות",
        activeListingsCount
      )}
      {statCard(
        <Clock className="h-5 w-5" />,
        "בקשות ממתינות",
        pendingBookingRequestsCount
      )}
      {statCard(
        <CalendarCheck className="h-5 w-5" />,
        "איסופים קרובים",
        upcomingPickupsCount
      )}
      {statCard(
        <Car className="h-5 w-5" />,
        "השכרות פעילות",
        activeRentalsCount
      )}
      {statCard(
        <CheckCircle className="h-5 w-5" />,
        "הזמנות שהושלמו",
        completedBookingsCount
      )}
      {statCard(
        <Banknote className="h-5 w-5" />,
        "הכנסות (שולמו)",
        formatMoneyIls(earningsIls)
      )}
    </div>
  );
}
