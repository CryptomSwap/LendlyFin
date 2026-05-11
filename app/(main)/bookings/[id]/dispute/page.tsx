"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/** Matches app/api/bookings/[id]/dispute/route.ts VALID_USER_REASON_CODES */
const USER_REASONS = [
  { value: "damage", label: "נזק" },
  { value: "missing_items", label: "פריטים חסרים" },
  { value: "item_not_as_described", label: "הפריט לא כמתואר" },
  { value: "late_return", label: "איחור בהחזרה" },
  { value: "non_return", label: "אי-החזרה" },
  { value: "item_not_working", label: "תקלה / לא עובד" },
  { value: "handoff_conflict", label: "סכסוך איסוף/החזרה" },
  { value: "policy_violation", label: "הפרת מדיניות" },
  { value: "payment_issue", label: "תשלום / החזר" },
  { value: "communication_issue", label: "תקשורת / תיאום" },
  { value: "manual", label: "אחר" },
] as const;

export default function BookingDisputePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [userReasonCode, setUserReasonCode] =
    useState<(typeof USER_REASONS)[number]["value"]>("damage");
  const [note, setNote] = useState("");
  const [evidenceLines, setEvidenceLines] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const evidenceChecklist = evidenceLines
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/bookings/${id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userReasonCode,
          note: note.trim() || undefined,
          ...(evidenceChecklist.length > 0 ? { evidenceChecklist } : {}),
        }),
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
                value={userReasonCode}
                onChange={(e) =>
                  setUserReasonCode(e.target.value as (typeof USER_REASONS)[number]["value"])
                }
                className="input-base w-full"
              >
                {USER_REASONS.map((r) => (
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

            <div className="space-y-2">
              <label className="text-sm font-medium">רשימת ראיות (שורה לכל פריט, אופציונלי)</label>
              <textarea
                value={evidenceLines}
                onChange={(e) => setEvidenceLines(e.target.value)}
                rows={3}
                className="input-base w-full min-h-[72px] resize-y"
                placeholder={"למשל:\nצילום מצב לפני\nהודעה בתאריך..."}
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
