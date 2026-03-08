"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoadingBlock } from "@/components/ui/loading-block";
import { RETURN_PHOTO_ANGLES } from "@/lib/booking-auth";

const ANGLE_LABELS: Record<string, string> = {
  front: "מבט קדמי",
  side: "מבט צד",
  accessories: "אביזרים",
};

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

  const fetchChecklist = async () => {
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
  };

  useEffect(() => {
    fetchChecklist();
  }, [bookingId]);

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
      <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
        <LoadingBlock message="טוען רשימת החזרה..." variant="full" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>רשימת החזרה הושלמה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>ההחזרה תועדה. {checklist?.damageReported || checklist?.missingItemsReported ? "ההזמנה בבדיקה בשל דיווח על נזק או פריטים חסרים." : "ההזמנה הושלמה."}</p>
          <Link href={`/bookings/${bookingId}`} className="text-primary hover:underline inline-block">
            חזרה להזמנה
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">תיעוד החזרה</CardTitle>
          <p className="text-sm text-muted-foreground">
            אשר את מצב הפריט בהחזרה. סמן אם יש נזק או פריטים חסרים – ההזמנה תעבור לבדיקה ולא תיסגר אוטומטית.
            העלה תמונות משלוש הזוויות הנדרשות.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="space-y-2">
              <Alert variant="error">{error}</Alert>
              <Button type="button" variant="outline" size="sm" onClick={() => fetchChecklist()}>
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
                className="rounded border-input"
              />
              <span className="text-sm font-medium">אישרתי שמצב הפריט בהחזרה תועד</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={damageReported}
                onChange={(e) => setDamageReported(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">דווח על נזק לפריט</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={missingItemsReported}
                onChange={(e) => setMissingItemsReported(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">דווח על פריטים או אביזרים חסרים</span>
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
            <p className="form-helper mb-3">
              העלה תמונה אחת לכל זווית: מבט קדמי, מבט צד, אביזרים.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {RETURN_PHOTO_ANGLES.map((angle) => (
                <div key={angle} className="space-y-1">
                  <p className="text-xs font-medium">{ANGLE_LABELS[angle]}</p>
                  {photoByAngle(angle) ? (
                    <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={photoByAngle(angle)}
                        alt={ANGLE_LABELS[angle]}
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white text-xs">
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
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoUpload(angle, f);
                        }}
                      />
                      <span className="text-xs text-muted-foreground">העלה תמונה</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !canComplete}
            className="w-full"
          >
            {submitting ? "שומר..." : "שלם רשימת החזרה"}
          </Button>
          {!canComplete && (
            <p className="text-xs text-muted-foreground">
              יש לאשר את מצב הפריט ולהעלות תמונות לכל שלוש הזוויות.
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
