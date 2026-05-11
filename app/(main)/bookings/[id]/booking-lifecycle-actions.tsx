"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type Actor = "renter" | "owner";

export function BookingLifecycleActions({
  bookingId,
  status,
  actor,
}: {
  bookingId: string;
  status: string;
  actor: Actor;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cancel" | "no_show" | null>(null);

  const canCancel = status === "REQUESTED" || status === "CONFIRMED";
  const canNoShow = status === "CONFIRMED" || status === "ACTIVE";

  async function postCancel() {
    setBusy("cancel");
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor,
          reasonCode: "user_requested",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "לא ניתן לבטל את ההזמנה");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setBusy(null);
    }
  }

  async function postNoShow() {
    setBusy("no_show");
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/no-show`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actor }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "לא ניתן לסמן אי-הגעה");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setBusy(null);
    }
  }

  if (!canCancel && !canNoShow) return null;

  return (
    <Card className="shadow-soft border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">ניהול הזמנה</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          ביטול או סימון אי-הגעה לפי המדיניות בפיילוט.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <Alert variant="error">{error}</Alert>}
        {canCancel && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy !== null}
            onClick={() => postCancel()}
          >
            {busy === "cancel" ? "מבצע..." : "בטל הזמנה"}
          </Button>
        )}
        {canNoShow && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy !== null}
            onClick={() => postNoShow()}
          >
            {busy === "no_show" ? "מבצע..." : "סמן אי-הגעה (צד המדווח)"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
