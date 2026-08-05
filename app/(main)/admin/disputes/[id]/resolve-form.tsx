"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
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
    <div className="rounded-[8px] border border-black/10 bg-white p-4">
      <div className="mb-2">
        <h2 className="font-sans text-[15px] font-black text-black">סגור מחלוקת</h2>
        <p className="font-assistant text-[13px] text-[#888888]">
          בחר החלטה, קוד סיבה ונימוק החלטה. הנתונים ישמרו ביומן בקרה.
        </p>
      </div>
      <div>
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
                  className="rounded-full border-black/15 text-[#1A8C6A] focus:ring-[#1A8C6A]/20"
                />
                <span className="font-assistant text-[13px] text-black">לטובת בעלים (שחרור פיקדון לבעלים)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="renter"
                  checked={resolution === "renter"}
                  onChange={() => setResolution("renter")}
                  className="rounded-full border-black/15 text-[#1A8C6A] focus:ring-[#1A8C6A]/20"
                />
                <span className="font-assistant text-[13px] text-black">לטובת שוכר (שחרור פיקדון לשוכר)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="split"
                  checked={resolution === "split"}
                  onChange={() => setResolution("split")}
                  className="rounded-full border-black/15 text-[#1A8C6A] focus:ring-[#1A8C6A]/20"
                />
                <span className="font-assistant text-[13px] text-black">פיצול (חלוקת פיקדון ידנית)</span>
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
          <div className="rounded-[8px] border border-black/10 bg-black/[0.02] p-3 font-assistant text-[12px] text-[#888888]">
            <p className="mb-1 font-sans text-[13px] font-bold text-black">סיכום פעולה לפני שליחה</p>
            <p>תוצאה: {resolution === "owner" ? "לטובת בעלים" : resolution === "renter" ? "לטובת שוכר" : "פיצול"}</p>
            <p>קוד סיבה: {adminReasonCode}</p>
            <p>פעולה: סגירת מחלוקת והעברת הזמנה לסטטוס הושלמה.</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-[#157A5A] disabled:opacity-50"
          >
            {submitting ? "שומר..." : "סגור מחלוקת והעבר להזמנה הושלמה"}
          </button>
        </form>
      </div>
    </div>
  );
}
