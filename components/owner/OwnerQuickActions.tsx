import Link from "next/link";
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
    href: "/owner",
    label: "הזמנות והודעות",
    icon: MessageSquare,
    description: "צפה בהזמנות ופתח שיחות",
  },
];

export default function OwnerQuickActions({ className }: OwnerQuickActionsProps) {
  return (
    <div
      className={cn("rounded-[8px] border border-black/10 bg-white p-5", className)}
      dir="rtl"
    >
      <h2 className="mb-3 font-sans text-[16px] font-black text-black">פעולות מהירות</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className="flex items-start gap-3 rounded-[8px] border border-black/10 bg-white px-4 py-3 transition-colors hover:bg-black/[0.02]"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#1A8C6A]" />
              <span className="flex flex-col items-start text-right">
                <span className="font-sans text-[14px] font-bold text-black">{action.label}</span>
                <span className="font-assistant text-[12px] text-[#888888]">
                  {action.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
