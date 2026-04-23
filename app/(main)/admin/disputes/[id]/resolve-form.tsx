"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REASON_CODE_OPTIONS = [
  { value: "damage", label: "נזק לפריט" },
  { value: "missing_parts", label: "פריטים/אביזרים חסרים" },
  { value: "late_return", label: "החזרה באיחור" },
  { value: "non_return", label: "אי-החזרה" },
  { value: "item_not_as_described", label: "פריט שונה מהמודעה" },
  { value: "item_not_working", label: "פריט לא תקין" },
  { value: "handoff_conflict", label: "מחלוקת מסירה/החזרה" },
  { value: "policy_violation", label: "הפרת כללי פלטפורמה" },
  { value: "evidence_insufficient", label: "ראיות לא מספקות" },
  { value: "other", label: "אחר" },
] as const;

const EVIDENCE_OPTIONS = [
  { value: "pickup_photos", label: "נבדקו תמונות איסוף" },
  { value: "return_photos", label: "נבדקו תמונות החזרה" },
  { value: "chat_history", label: "נבדקה התכתבות בין הצדדים" },
  { value: "timeline_consistency", label: "נבדקה עקביות זמנים" },
] as const;

export default function ResolveDisputeForm({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [resolution, setResolution] = useState<"owner" | "renter" | "split">("owner");
  const [adminReasonCode, setAdminReasonCode] = useState<(typeof REASON_CODE_OPTIONS)[number]["value"]>("damage");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [financialNote, setFinancialNote] = useState("");
  const [evidenceChecklist, setEvidenceChecklist] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          adminReasonCode,
          decisionRationale: decisionRationale.trim(),
          adminNote: adminNote.trim() || undefined,
          financialNote: financialNote.trim() || undefined,
          evidenceChecklist,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "שגיאה בסגירת המחלוקת");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאה בסגירת המחלוקת");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">סגור מחלוקת</CardTitle>
        <p className="text-sm text-muted-foreground">
          בחר החלטה, קוד סיבה ונימוק החלטה. הנתונים ישמרו ביומן בקרה.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="form-group">
            <span className="form-label mb-2 block">החלטה</span>
            <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="החלטה">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="owner"
                  checked={resolution === "owner"}
                  onChange={() => setResolution("owner")}
                  className="rounded-full border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">לטובת בעלים (שחרור פיקדון לבעלים)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="renter"
                  checked={resolution === "renter"}
                  onChange={() => setResolution("renter")}
                  className="rounded-full border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">לטובת שוכר (שחרור פיקדון לשוכר)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="split"
                  checked={resolution === "split"}
                  onChange={() => setResolution("split")}
                  className="rounded-full border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">פיצול (חלוקת פיקדון ידנית)</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <Label htmlFor="resolve-reason-code">קוד סיבה (חובה)</Label>
            <select
              id="resolve-reason-code"
              value={adminReasonCode}
              onChange={(e) => setAdminReasonCode(e.target.value as (typeof REASON_CODE_OPTIONS)[number]["value"])}
              className="input-base w-full max-w-md"
              disabled={submitting}
            >
              {REASON_CODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <Label htmlFor="resolve-rationale">נימוק החלטה (חובה)</Label>
            <textarea
              id="resolve-rationale"
              value={decisionRationale}
              onChange={(e) => setDecisionRationale(e.target.value)}
              placeholder="למה התקבלה החלטה זו? אילו ראיות נבדקו ומה הייתה המסקנה."
              rows={4}
              className="input-base w-full min-h-[110px] resize-y"
              disabled={submitting}
              required
            />
          </div>
          <div className="form-group">
            <Label htmlFor="resolve-financial-note">הערת פעולה פיננסית (חובה)</Label>
            <Input
              id="resolve-financial-note"
              value={financialNote}
              onChange={(e) => setFinancialNote(e.target.value)}
              placeholder="לדוגמה: שחרור מלא לבעלים לאחר אימות נזק מתועד"
              className="max-w-md w-full"
              disabled={submitting}
              required
            />
          </div>
          <div className="form-group">
            <span className="form-label mb-2 block">בסיס ראיות שנבדק (מומלץ)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
              {EVIDENCE_OPTIONS.map((option) => {
                const checked = evidenceChecklist.includes(option.value);
                return (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setEvidenceChecklist((prev) =>
                          e.target.checked
                            ? [...prev, option.value]
                            : prev.filter((item) => item !== option.value)
                        );
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <Label htmlFor="resolve-admin-note">הערה (אופציונלי)</Label>
            <Input
              id="resolve-admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="הערת סיום..."
              className="max-w-md w-full"
              disabled={submitting}
            />
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">סיכום פעולה לפני שליחה</p>
            <p>תוצאה: {resolution === "owner" ? "לטובת בעלים" : resolution === "renter" ? "לטובת שוכר" : "פיצול"}</p>
            <p>קוד סיבה: {adminReasonCode}</p>
            <p>פעולה: סגירת מחלוקת והעברת הזמנה לסטטוס הושלמה.</p>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "שומר..." : "סגור מחלוקת והעבר להזמנה הושלמה"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
