"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  bookingId: string;
  status: string;
};

type NextStatus = "CONFIRMED" | "ACTIVE" | "COMPLETED";

function getAction(status: string): { label: string; nextStatus: NextStatus } | null {
  if (status === "REQUESTED") {
    return { label: "אשר הזמנה", nextStatus: "CONFIRMED" };
  }
  if (status === "CONFIRMED") {
    return { label: "התחל השכרה", nextStatus: "ACTIVE" };
  }
  if (status === "ACTIVE") {
    return { label: "סיים השכרה", nextStatus: "COMPLETED" };
  }
  return null;
}

export default function OwnerBookingActionButtons({ bookingId, status }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = getAction(status);
  if (!action) return null;
  const nextStatus = action.nextStatus;

  async function handleAction() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "לא הצלחנו לעדכן סטטוס הזמנה");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={submitting}
        onClick={handleAction}
      >
        {submitting ? "מעדכן..." : action.label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
