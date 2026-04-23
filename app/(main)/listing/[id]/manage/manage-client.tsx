"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingBlock } from "@/components/ui/loading-block";
import { getListingStatusLabel, getListingStatusPillVariant } from "@/lib/status-labels";
import { StatusPill } from "@/components/ui/status-pill";
import ListingAvailabilityCalendar from "@/components/listings/ListingAvailabilityCalendar";

type BlockedRange = {
  id: string;
  startDate: string;
  endDate: string;
};

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ManageListingAvailability({
  listingId,
  listingTitle,
  listingStatus,
  pickupNote,
  rules,
}: {
  listingId: string;
  listingTitle: string;
  listingStatus: string;
  pickupNote: string;
  rules: string;
}) {
  const [ranges, setRanges] = useState<BlockedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editPickupNote, setEditPickupNote] = useState(pickupNote);
  const [editRules, setEditRules] = useState(rules);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchRanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/blocked-ranges`);
      if (!res.ok) {
        if (res.status === 401) {
          setError("יש להתחבר כדי לנהל זמינות.");
          setRanges([]);
          return;
        }
        setError("שגיאה בטעינת תאריכים חסומים");
        return;
      }
      const data = await res.json();
      setRanges(data.ranges ?? []);
    } catch {
      setError("שגיאה בטעינת תאריכים חסומים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanges();
  }, [listingId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStart || !addEnd) {
      setError("נא לבחור תאריך התחלה וסיום");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/blocked-ranges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(addStart).toISOString(),
          endDate: new Date(addEnd).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "שגיאה בהוספת תאריכים חסומים");
        return;
      }
      setSuccess("תאריכים חסומים נוספו בהצלחה");
      setAddStart("");
      setAddEnd("");
      fetchRanges();
    } catch {
      setError("שגיאה בהוספת תאריכים חסומים");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rangeId: string) => {
    setDeletingId(rangeId);
    setError(null);
    try {
      const res = await fetch(
        `/api/listings/${listingId}/blocked-ranges/${rangeId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setError("שגיאה במחיקת טווח");
        return;
      }
      setSuccess("טווח התאריכים נמחק");
      setRanges((prev) => prev.filter((r) => r.id !== rangeId));
    } catch {
      setError("שגיאה במחיקת טווח");
    } finally {
      setDeletingId(null);
    }
  };

  const statusLabel = getListingStatusLabel(listingStatus);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsSaving(true);
    setDetailsSuccess(null);
    setDetailsError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupNote: editPickupNote.trim() || null,
          rules: editRules.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDetailsError(data?.error ?? "שגיאה בעדכון הפרטים");
        return;
      }
      setDetailsSuccess("הפרטים נשמרו בהצלחה");
    } catch {
      setDetailsError("שגיאה בעדכון הפרטים");
    } finally {
      setDetailsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="section-title">{listingTitle}</h1>
        <StatusPill variant={getListingStatusPillVariant(listingStatus)} className="mt-1">
          {statusLabel}
        </StatusPill>
      </header>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">הוראות איסוף וכללים</CardTitle>
          <p className="text-sm text-muted-foreground">
            הוראות איסוף וכללי שימוש למודעה. ניתן לעדכן בכל עת.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {detailsError && (
            <Alert variant="error">{detailsError}</Alert>
          )}
          {detailsSuccess && (
            <Alert variant="success">{detailsSuccess}</Alert>
          )}
          <form onSubmit={handleSaveDetails} className="space-y-5">
            <div className="form-group">
              <Label htmlFor="manage-pickup-note">הוראות איסוף (אופציונלי)</Label>
              <Input
                id="manage-pickup-note"
                value={editPickupNote}
                onChange={(e) => setEditPickupNote(e.target.value)}
                placeholder="למשל: איסוף עצמי מתל אביב, או משלוח בתוספת תשלום"
              />
            </div>
            <div className="form-group">
              <Label htmlFor="manage-rules">כללים (אופציונלי)</Label>
              <textarea
                id="manage-rules"
                value={editRules}
                onChange={(e) => setEditRules(e.target.value)}
                placeholder="כללי שימוש, הגבלות..."
                rows={2}
                className="input-base w-full min-h-[80px] resize-y"
                disabled={detailsSaving}
              />
            </div>
            <Button type="submit" disabled={detailsSaving}>
              {detailsSaving ? "שומר..." : "שמור פרטים"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">לוח זמינות</CardTitle>
          <p className="text-sm text-muted-foreground">
            צפייה בחודש: זמין, חסום (ידני) או תפוס (הזמנה). ניתן לחסום טווח תאריכים מהכפתור למטה או מהטופס.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ListingAvailabilityCalendar
            listingId={listingId}
            onBlockSuccess={fetchRanges}
          />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">ניהול זמינות – תאריכים חסומים</CardTitle>
          <p className="text-sm text-muted-foreground">
            תאריכים חסומים הם תקופות שבהן הפריט לא זמין להשכרה. השוכרים לא יוכלו
            לבחור תאריכים אלה בהזמנה. ניתן לנהל זמינות בכל עת (גם כשהמודעה
            ממתינה לאישור).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="error">{error}</Alert>
          )}
          {success && (
            <Alert variant="success">{success}</Alert>
          )}

          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <div className="form-group min-w-0">
              <Label htmlFor="manage-block-start">מתאריך</Label>
              <Input
                id="manage-block-start"
                type="date"
                value={addStart}
                onChange={(e) => setAddStart(e.target.value)}
                className="w-full"
                disabled={submitting}
              />
            </div>
            <div className="form-group min-w-0">
              <Label htmlFor="manage-block-end">עד תאריך</Label>
              <Input
                id="manage-block-end"
                type="date"
                value={addEnd}
                onChange={(e) => setAddEnd(e.target.value)}
                className="w-full"
                disabled={submitting}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto md:self-end">
              {submitting ? "מוסיף..." : "הוסף תאריכים חסומים"}
            </Button>
          </form>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              תאריכים חסומים כרגע
              {!loading && ranges.length > 0 && (
                <span className="text-muted-foreground font-normal mr-1">({ranges.length})</span>
              )}
            </h3>
            {loading ? (
              <LoadingBlock message="טוען תאריכים חסומים..." variant="inline" />
            ) : ranges.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                אין תאריכים חסומים. המודעה זמינה בכל התאריכים עד שתוסיף טווחים.
              </div>
            ) : (
              <ul className="space-y-2">
                {ranges.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === r.id}
                      onClick={() => handleDelete(r.id)}
                    >
                      {deletingId === r.id ? "מוחק..." : "הסר"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        <Link href={`/listing/${listingId}`} className="text-primary hover:underline">
          חזרה למודעה
        </Link>
      </p>
    </div>
  );
}
