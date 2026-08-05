"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingBlock } from "@/components/ui/loading-block";

const RETURN_PHOTO_ANGLES = ["front", "side", "accessories"] as const;

const ANGLE_LABELS: Record<string, string> = {
  front: "מבט קדמי",
  side: "מבט צד",
  accessories: "אביזרים",
};

const PRIMARY_BTN =
  "w-full rounded-full bg-[#1A8C6A] font-sans font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:bg-[#167A5C] hover:-translate-y-[2px] transition-all duration-300";
const SECONDARY_BTN =
  "rounded-full border border-black/15 bg-white font-sans font-bold text-black shadow-none hover:bg-black/5";

export default function ReturnChecklistForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<{
    conditionConfirmed: boolean;
    damageReported: boolean;
    missingItemsReported: boolean;
    notes: string | null;
    completedAt: string | null;
  } | null>(null);
  const [photos, setPhotos] = useState<{ angle: string; url: string }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [conditionConfirmed, setConditionConfirmed] = useState(false);
  const [damageReported, setDamageReported] = useState(false);
  const [missingItemsReported, setMissingItemsReported] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchChecklist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/return-checklist`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("יש להתחבר כדי למלא את רשימת ההחזרה.");
          return;
        }
        setError("שגיאה בטעינת רשימת החזרה");
        return;
      }
      const data = await res.json();
      setChecklist(data.checklist);
      setPhotos(data.photos ?? []);
      setIsComplete(!!data.isComplete);
      if (data.checklist) {
        setConditionConfirmed(!!data.checklist.conditionConfirmed);
        setDamageReported(!!data.checklist.damageReported);
        setMissingItemsReported(!!data.checklist.missingItemsReported);
        setNotes(data.checklist.notes ?? "");
      }
    } catch {
      setError("שגיאה בטעינת רשימת החזרה");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const handlePhotoUpload = async (angle: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    const formData = new FormData();
    formData.set("type", "return");
    formData.set("angle", angle);
    formData.set("file", file);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checklist-photos`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "שגיאה בהעלאת תמונה");
        return;
      }
      setPhotos((prev) => {
        const rest = prev.filter((p) => p.angle !== angle);
        return [...rest, { angle, url: data.url }];
      });
    } catch {
      setError("שגיאה בהעלאת תמונה");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/return-checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionConfirmed,
          damageReported,
          missingItemsReported,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "שגיאה בשמירה");
        return;
      }
      setChecklist(data.checklist);
      if (data.bookingStatus === "COMPLETED") {
        setSuccess("רשימת ההחזרה הושלמה. ההזמנה נסגרה בהצלחה.");
        setIsComplete(true);
        setTimeout(() => router.push(`/bookings/${bookingId}`), 1500);
      } else if (data.bookingStatus === "DISPUTE") {
        setSuccess("רשימת ההחזרה נשמרה. דווחו נזק או פריטים חסרים – ההזמנה הועברה לבדיקה.");
        setIsComplete(true);
        setTimeout(() => router.push(`/bookings/${bookingId}`), 2000);
      } else {
        setSuccess("נשמר.");
      }
    } catch {
      setError("שגיאה בשמירה");
    } finally {
      setSubmitting(false);
    }
  };

  const photoByAngle = (angle: string) => photos.find((p) => p.angle === angle)?.url;
  const hasAllPhotos = RETURN_PHOTO_ANGLES.every((a) => photoByAngle(a));
  const canComplete = conditionConfirmed && hasAllPhotos;
  const hasIssue = damageReported || missingItemsReported;

  if (loading) {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
        <LoadingBlock message="טוען רשימת החזרה..." variant="full" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
        <h2 className="font-sans text-base font-bold text-black">רשימת החזרה הושלמה</h2>
        <p className="font-assistant text-[14px] text-[#888888]">
          ההחזרה תועדה. {checklist?.damageReported || checklist?.missingItemsReported ? "ההזמנה בבדיקה בשל דיווח על נזק או פריטים חסרים." : "ההזמנה הושלמה."}
        </p>
        <Link href={`/bookings/${bookingId}`} className="font-sans font-bold text-[#1A8C6A] hover:underline inline-block">
          חזרה להזמנה
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-4">
        <div>
          <h2 className="font-sans text-lg font-bold text-black">תיעוד החזרה</h2>
          <p className="font-assistant text-[14px] text-[#888888] mt-1">
            אשר את מצב הפריט בהחזרה. סמן אם יש נזק או פריטים חסרים – ההזמנה תעבור לבדיקה ולא תיסגר אוטומטית.
            העלה תמונות משלוש הזוויות הנדרשות.
          </p>
        </div>

        {error && (
          <div className="space-y-2">
            <Alert variant="error">{error}</Alert>
            <Button type="button" variant="outline" size="sm" className={SECONDARY_BTN} onClick={() => fetchChecklist()}>
              נסה שוב
            </Button>
          </div>
        )}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={conditionConfirmed}
              onChange={(e) => setConditionConfirmed(e.target.checked)}
              className="rounded border-black/15 accent-[#1A8C6A]"
            />
            <span className="font-assistant text-[14px] font-medium text-black">אישרתי שמצב הפריט בהחזרה תועד</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={damageReported}
              onChange={(e) => setDamageReported(e.target.checked)}
              className="rounded border-black/15 accent-[#1A8C6A]"
            />
            <span className="font-assistant text-[14px] font-medium text-black">דווח על נזק לפריט</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={missingItemsReported}
              onChange={(e) => setMissingItemsReported(e.target.checked)}
              className="rounded border-black/15 accent-[#1A8C6A]"
            />
            <span className="font-assistant text-[14px] font-medium text-black">דווח על פריטים או אביזרים חסרים</span>
          </label>
        </div>

        {hasIssue && (
          <Alert variant="warning">
            סימון נזק או פריטים חסרים יעביר את ההזמנה לסטטוס בדיקה. ההזמנה לא תיסגר אוטומטית.
          </Alert>
        )}

        <div className="form-group">
          <Label htmlFor="return-notes">הערות (אופציונלי)</Label>
          <textarea
            id="return-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="תאר נזק, פריטים חסרים או הערות נוספות..."
            rows={3}
            className="input-base w-full min-h-[80px] resize-y"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <p className="form-label mb-2">תמונות נדרשות *</p>
          <p className="font-assistant text-[14px] text-[#888888] mb-3">
            העלה תמונה אחת לכל זווית: מבט קדמי, מבט צד, אביזרים.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RETURN_PHOTO_ANGLES.map((angle) => (
              <div key={angle} className="space-y-1">
                <p className="font-sans text-xs font-bold text-black">{ANGLE_LABELS[angle]}</p>
                {photoByAngle(angle) ? (
                  <div className="relative aspect-square rounded-[8px] border border-black/10 overflow-hidden bg-black/5">
                    {(() => {
                      const photoUrl = photoByAngle(angle);
                      if (!photoUrl) return null;
                      return (
                    <Image
                      src={photoUrl}
                      alt={ANGLE_LABELS[angle]}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                      );
                    })()}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-sans font-bold">
                      החלף
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoUpload(angle, f);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-black/15 rounded-[8px] cursor-pointer hover:bg-black/5 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handlePhotoUpload(angle, f);
                      }}
                    />
                    <span className="font-assistant text-xs text-[#888888]">העלה תמונה</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || !canComplete}
          className={PRIMARY_BTN}
        >
          {submitting ? "שומר..." : "שלם רשימת החזרה"}
        </Button>
        {!canComplete && (
          <p className="font-assistant text-[12px] text-[#888888]">
            יש לאשר את מצב הפריט ולהעלות תמונות לכל שלוש הזוויות.
          </p>
        )}
      </div>
    </form>
  );
}
