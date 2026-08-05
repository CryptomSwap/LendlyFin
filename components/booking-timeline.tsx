"use client";

import { BookingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STEPS: { key: BookingStatus; title: string; subtitle: string }[] = [
  { key: "REQUESTED", title: "בקשה נשלחה", subtitle: "ממתינים לאישור המשכיר" },
  { key: "CONFIRMED", title: "אושר", subtitle: "אפשר לתאם איסוף" },
  { key: "ACTIVE", title: "פעיל", subtitle: "ההשכרה בעיצומה" },
  { key: "COMPLETED", title: "הושלם", subtitle: "הפריט הוחזר וההזמנה נסגרה" },
];

function stepIndex(status: BookingStatus) {
  const idx = STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;

  // DISPUTE doesn't fit the linear path:
  return -1;
}

export function BookingTimeline({ status }: { status: BookingStatus }) {
  const idx = stepIndex(status);

  if (status === "DISPUTE") {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-right text-base font-semibold">מחלוקת פתוחה</div>
        <div className="text-right text-sm text-muted-foreground">יש בעיה שדורשת טיפול.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="text-right text-base font-semibold">סטטוס הזמנה</div>
      <div className="mt-4 space-y-3">
        {STEPS.map((s, i) => {
          const done = idx >= i;
          const current = idx === i;

          return (
            <div key={s.key} className="flex flex-row-reverse items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 h-3 w-3 rounded-full border",
                  done && "bg-foreground",
                  !done && "bg-background"
                )}
                aria-hidden
              />
              <div className="flex-1 text-right">
                <div className={cn("text-sm font-medium", current && "text-foreground")}>
                  {s.title}
                </div>
                <div className="text-xs text-muted-foreground">{s.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
