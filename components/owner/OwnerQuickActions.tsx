import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { List, Calendar, MessageSquare, PlusCircle } from "lucide-react";

export interface OwnerQuickActionsProps {
  className?: string;
}

const actions = [
  {
    href: "/add",
    label: "הוסף מודעה",
    icon: PlusCircle,
    description: "פרסם פריט חדש להשכרה",
  },
  {
    href: "/owner#listings",
    label: "המודעות שלי",
    icon: List,
    description: "נהל מודעות וזמינות",
  },
  {
    href: "/owner#listings",
    label: "ניהול זמינות",
    icon: Calendar,
    description: "חסום תאריכים מלוח המודעות",
  },
  {
    href: "/bookings",
    label: "הזמנות והודעות",
    icon: MessageSquare,
    description: "צפה בהזמנות ופתח שיחות",
  },
];

export default function OwnerQuickActions({ className }: OwnerQuickActionsProps) {
  return (
    <Card className={cn("shadow-soft", className)} dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-2.5"
                asChild
              >
                <span>
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col items-start text-right">
                    <span className="font-medium">{action.label}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {action.description}
                    </span>
                  </span>
                </span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
