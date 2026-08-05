"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function StartRentalButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextStatus: "ACTIVE", actor: "SYSTEM" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "לא הצלחנו להתחיל השכרה");
        return;
      }

      router.refresh(); // re-fetch server component data
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-right text-sm text-red-600">{error}</div>}
      <Button className="w-full" disabled={loading} onClick={start}>
        {loading ? "מתחיל..." : "התחלת השכרה"}
      </Button>
    </div>
  );
}
