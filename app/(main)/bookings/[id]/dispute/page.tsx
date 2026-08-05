"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageContainer } from "@/components/layout";

const REASONS = [
  { value: "damage", label: "נזק" },
  { value: "missing_items", label: "פריטים חסרים" },
  { value: "manual", label: "אחר" },
] as const;

const PRIMARY_BTN =
  "w-full rounded-full bg-[#1A8C6A] font-sans font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:bg-[#167A5C] hover:-translate-y-[2px] transition-all duration-300";

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
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="max-w-md space-y-4 py-6">
        <Link href={`/bookings/${id}`} className="font-assistant text-[14px] text-[#888888] hover:text-black">
          חזרה להזמנה
        </Link>

        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-4">
          <h1 className="page-title text-[24px] md:text-[28px]">פתיחת מחלוקת</h1>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="space-y-2">
            <label className="font-sans text-sm font-bold text-black">סיבה</label>
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
            <label className="font-sans text-sm font-bold text-black">הערות (אופציונלי)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="input-base w-full min-h-[100px] resize-y"
              placeholder="פרטו מה קרה כדי לעזור לצוות התמיכה."
            />
          </div>

          <Button onClick={submit} disabled={saving} className={PRIMARY_BTN}>
            {saving ? "שולח..." : "פתח מחלוקת"}
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}
