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
import { PICKUP_PHOTO_ANGLES } from "@/lib/booking-auth";

const ANGLE_LABELS: Record<string, string> = {
  front: "מבט קדמי",
  side: "מבט צד",
  accessories: "אביזרים",
};

export default function PickupChecklistForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<{ angle: string; url: string }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [accessoriesConfirmed, setAccessoriesConfirmed] = useState(false);
  const [conditionConfirmed, setConditionConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchChecklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pickup-checklist`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("יש להתחבר כדי למלא את רשימת האיסוף.");
          return;
        }
        setError("שגיאה בטעינת רשימת איסוף");
        return;
      }
      const data = await res.json();
      setPhotos(data.photos ?? []);
      setIsComplete(!!data.isComplete);
      if (data.checklist) {
        setAccessoriesConfirmed(!!data.checklist.accessoriesConfirmed);
        setConditionConfirmed(!!data.checklist.conditionConfirmed);
        setNotes(data.checklist.notes ?? "");
      }
    } catch {
      setError("שגיאה בטעינת רשימת איסוף");
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
    formData.set("type", "pickup");
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
      const res = await fetch(`/api/bookings/${bookingId}/pickup-checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessoriesConfirmed,
          conditionConfirmed,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "שגיאה בשמירה");
        return;
      }
      if (data.bookingStatus === "ACTIVE") {
        setSuccess("רשימת האיסוף הושלמה וההזמנה הופעלה.");
        setIsComplete(true);
        setTimeout(() => router.push(`/bookings/${bookingId}`), 1500);
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
  const hasAllPhotos = PICKUP_PHOTO_ANGLES.every((a) => photoByAngle(a));
  const canComplete = accessoriesConfirmed && conditionConfirmed && hasAllPhotos;

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
        <LoadingBlock message="טוען רשימת איסוף..." variant="full" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>רשימת איסוף הושלמה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>איסוף תועד בהצלחה. ההזמנה פעילה.</p>
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
          <CardTitle className="text-lg">תיעוד איסוף</CardTitle>
          <p className="text-sm text-muted-foreground">
            אשר את מצב הפריט והאביזרים בזמן האיסוף. העלה תמונות משלוש הזוויות הנדרשות.
            לאחר השלמה ההזמנה תעבור לסטטוס פעיל.
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
                checked={accessoriesConfirmed}
                onChange={(e) => setAccessoriesConfirmed(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">אישרתי שהאביזרים (כבלים, תיק וכו&apos;) נמסרו כמצוין במודעה</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={conditionConfirmed}
                onChange={(e) => setConditionConfirmed(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm font-medium">אישרתי שמצב הפריט תועד (ללא נזקים שלא צוינו)</span>
            </label>
          </div>

          <div className="form-group">
            <Label htmlFor="pickup-notes">הערות (אופציונלי)</Label>
            <textarea
              id="pickup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות על מצב הפריט, אביזרים חסרים..."
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
              {PICKUP_PHOTO_ANGLES.map((angle) => (
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
            {submitting ? "שומר..." : "שלם רשימת איסוף"}
          </Button>
          {!canComplete && (
            <p className="text-xs text-muted-foreground">
              יש לסמן את שני האישורים ולהעלות תמונות לכל שלוש הזוויות.
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
