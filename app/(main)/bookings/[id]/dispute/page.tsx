"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const REASONS = [
  { value: "damage", label: "נזק" },
  { value: "missing_items", label: "פריטים חסרים" },
  { value: "manual", label: "אחר" },
] as const;

export default function BookingDisputePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("damage");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "שגיאה בפתיחת מחלוקת");
        setSaving(false);
        return;
      }
      router.push(`/bookings/${id}`);
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <Link href={`/bookings/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          חזרה להזמנה
        </Link>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>פתיחת מחלוקת</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="space-y-2">
              <label className="text-sm font-medium">סיבה</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as (typeof REASONS)[number]["value"])}
                className="input-base w-full"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">הערות (אופציונלי)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="input-base w-full min-h-[100px] resize-y"
                placeholder="פרטו מה קרה כדי לעזור לצוות התמיכה."
              />
            </div>

            <Button onClick={submit} disabled={saving} className="w-full">
              {saving ? "שולח..." : "פתח מחלוקת"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

