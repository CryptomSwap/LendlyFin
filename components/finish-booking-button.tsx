"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FinishBookingButton({
  bookingId,
  onSuccess,
}: {
  bookingId: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus: "COMPLETED", actor: "SYSTEM" }),
      });

      const text = await res.text();
      let msg = "לא הצלחנו לסיים את ההזמנה";

      try {
        const json = JSON.parse(text);
        msg = json?.error ?? msg;
      } catch {
        // non-json response
        msg = text || msg;
      }

      if (!res.ok) {
        setError(msg);
        return;
      }

      onSuccess?.();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-right text-sm text-red-600">{error}</div>}
      <Button className="w-full" disabled={loading} onClick={finish}>
        {loading ? "מסיים..." : "סיום הזמנה"}
      </Button>
    </div>
  );
}
