"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AdminConfirmPaymentForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/bookings/${bookingId}/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentNotes: notes || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "שגיאה באישור התשלום");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4" dir="rtl">
      <div className="form-group">
        <Label htmlFor="confirm-payment-notes">הערות (אופציונלי)</Label>
        <textarea
          id="confirm-payment-notes"
          className="input-base w-full"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="מזהה תשלום חיצוני, הערות..."
          disabled={loading}
        />
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" disabled={loading}>
        {loading ? "מאשר..." : "אשר תשלום ידנית"}
      </Button>
    </form>
  );
}
