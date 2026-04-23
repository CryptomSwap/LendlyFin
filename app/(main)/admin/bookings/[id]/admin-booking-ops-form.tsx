"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type Action = "mark_non_return_pending" | "confirm_non_return" | "complete_after_dispute_window";

export function AdminBookingOpsForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Action | null>(null);

  async function run(action: Action) {
    setSaving(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "שגיאה בעדכון ההזמנה");
        setSaving(null);
        return;
      }
      setNote("");
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <Alert variant="error">{error}</Alert>}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="input-base w-full min-h-[80px] resize-y"
        placeholder="הערת מנהל (אופציונלי)"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving !== null || currentStatus !== "ACTIVE"}
          onClick={() => run("mark_non_return_pending")}
        >
          סמן אי-החזרה
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving !== null || currentStatus !== "NON_RETURN_PENDING"}
          onClick={() => run("confirm_non_return")}
        >
          אשר אי-החזרה
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving !== null || currentStatus !== "RETURNED"}
          onClick={() => run("complete_after_dispute_window")}
        >
          סיים אחרי חלון מחלוקת
        </Button>
      </div>
    </div>
  );
}

