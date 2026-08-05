"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

/** Dev helper: PATCH status to ACTIVE then reload. Call from console: startRental(bookingId) */
export async function startRental(id: string) {
  await fetch(`/api/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nextStatus: "ACTIVE",
      actor: "LENDER",
    }),
  });
  window.location.reload();
}

type Props = {
  bookingId: string;
  status: BookingStatus;
  onStatusUpdated: (next: BookingStatus) => void;
};

export function BookingStatusActions({ bookingId, status, onStatusUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { startRental: (id: string) => void }).startRental = startRental;
    }
  }, []);

  const actions = useMemo(() => {
    // Minimal contextual CTAs for Phase 19.
    // Later: pickup checklist gates ACTIVE, return checklist gates COMPLETED. :contentReference[oaicite:12]{index=12}
    if (status === "REQUESTED") {
      return [
        { label: "לאשר (לבדיקות)", next: "CONFIRMED" as BookingStatus, actor: "LENDER" as const },
        { label: "פתיחת מחלוקת", next: "DISPUTE" as BookingStatus, actor: "RENTER" as const },
      ];
    }
    if (status === "CONFIRMED") {
      return [
        { label: "להתחיל השכרה (לבדיקות)", next: "ACTIVE" as BookingStatus, actor: "LENDER" as const },
        { label: "פתיחת מחלוקת", next: "DISPUTE" as BookingStatus, actor: "RENTER" as const },
      ];
    }
    if (status === "ACTIVE") {
      return [
        { label: "לסמן כהושלם (לבדיקות)", next: "COMPLETED" as BookingStatus, actor: "LENDER" as const },
        { label: "פתיחת מחלוקת", next: "DISPUTE" as BookingStatus, actor: "RENTER" as const },
      ];
    }
    return [];
  }, [status]);

  async function run(next: BookingStatus, actor: "RENTER" | "LENDER" | "ADMIN" | "SYSTEM") {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus: next, actor }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "שגיאה בביצוע פעולה");
        return;
      }

      onStatusUpdated(data.booking.status as BookingStatus);
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="rounded-2xl border p-4">
      <div className="text-right text-sm font-medium">פעולות</div>

      {error && (
        <div className="mt-2 text-right text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {actions.map((a) => (
          <Button
            key={a.label}
            className="w-full"
            disabled={loading || status === a.next}
            onClick={() => run(a.next, a.actor)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
