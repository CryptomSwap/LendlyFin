"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { CATEGORY_TAXONOMY } from "@/lib/constants";

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
  description,
  category,
  subcategory,
  city,
  pricePerDay,
  deposit,
  valueEstimate,
  pickupNote,
  rules,
}: {
  listingId: string;
  listingTitle: string;
  listingStatus: string;
  description: string;
  category: string;
  subcategory: string;
  city: string;
  pricePerDay: number;
  deposit: number;
  valueEstimate: number | null;
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

  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState(listingTitle);
  const [editDescription, setEditDescription] = useState(description);
  const [editCategory, setEditCategory] = useState(category);
  const [editSubcategory, setEditSubcategory] = useState(subcategory);
  const [editCity, setEditCity] = useState(city);
  const [editPrice, setEditPrice] = useState(pricePerDay);
  const [editDeposit, setEditDeposit] = useState(deposit);
  const [editValueEstimate, setEditValueEstimate] = useState(valueEstimate ?? 0);
  const [coreSaving, setCoreSaving] = useState(false);
  const [coreSuccess, setCoreSuccess] = useState<string | null>(null);
  const [coreError, setCoreError] = useState<string | null>(null);

  const selectedCategory = CATEGORY_TAXONOMY.find((c) => c.slug === editCategory);
  const subcategories = selectedCategory?.children ?? [];

  const fetchRanges = useCallback(async () => {
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
  }, [listingId]);

  useEffect(() => {
    fetchRanges();
  }, [fetchRanges]);

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

  const handleSaveCore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoreSaving(true);
    setCoreSuccess(null);
    setCoreError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          category: editCategory,
          subcategory: editSubcategory || null,
          city: editCity.trim(),
          pricePerDay: editPrice,
          deposit: editDeposit,
          valueEstimate: editValueEstimate || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCoreError(data?.error ?? "שגיאה בעדכון הפרטים");
        return;
      }
      setCoreSuccess("הפרטים עודכנו בהצלחה");
    } catch {
      setCoreError("שגיאה בעדכון הפרטים");
    } finally {
      setCoreSaving(false);
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
          <CardTitle className="text-base">פרטי מודעה</CardTitle>
          <p className="text-sm text-muted-foreground">
            עדכון פרטי המודעה. שינויים נשמרים ישירות ללא צורך באישור מחדש.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {coreError && <Alert variant="error">{coreError}</Alert>}
          {coreSuccess && <Alert variant="success">{coreSuccess}</Alert>}
          <form onSubmit={handleSaveCore} className="space-y-5">
            <div className="form-group">
              <Label htmlFor="manage-title">כותרת</Label>
              <Input
                id="manage-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                disabled={coreSaving}
              />
            </div>
            <div className="form-group">
              <Label htmlFor="manage-description">תיאור</Label>
              <textarea
                id="manage-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="input-base w-full min-h-[80px] resize-y"
                disabled={coreSaving}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <Label htmlFor="manage-category">קטגוריה</Label>
                <select
                  id="manage-category"
                  value={editCategory}
                  onChange={(e) => {
                    setEditCategory(e.target.value);
                    setEditSubcategory("");
                  }}
                  className="input-base w-full"
                  disabled={coreSaving}
                >
                  {CATEGORY_TAXONOMY.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div className="form-group">
                  <Label htmlFor="manage-subcategory">תת-קטגוריה</Label>
                  <select
                    id="manage-subcategory"
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    className="input-base w-full"
                    disabled={coreSaving}
                  >
                    <option value="">ללא</option>
                    {subcategories.map((sc) => (
                      <option key={sc.slug} value={sc.slug}>{sc.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="form-group">
              <Label htmlFor="manage-city">עיר</Label>
              <Input
                id="manage-city"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                required
                disabled={coreSaving}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <Label htmlFor="manage-price">מחיר ליום (₪)</Label>
                <Input
                  id="manage-price"
                  type="number"
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  required
                  disabled={coreSaving}
                />
              </div>
              <div className="form-group">
                <Label htmlFor="manage-deposit">פיקדון (₪)</Label>
                <Input
                  id="manage-deposit"
                  type="number"
                  min={0}
                  value={editDeposit}
                  onChange={(e) => setEditDeposit(Number(e.target.value))}
                  required
                  disabled={coreSaving}
                />
              </div>
              <div className="form-group">
                <Label htmlFor="manage-value">שווי מוערך (₪)</Label>
                <Input
                  id="manage-value"
                  type="number"
                  min={0}
                  value={editValueEstimate}
                  onChange={(e) => setEditValueEstimate(Number(e.target.value))}
                  disabled={coreSaving}
                />
              </div>
            </div>
            <Button type="submit" disabled={coreSaving}>
              {coreSaving ? "שומר..." : "שמור פרטים"}
            </Button>
          </form>
        </CardContent>
      </Card>

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

      <Card className="shadow-soft border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">מחיקת מודעה</CardTitle>
          <p className="text-sm text-muted-foreground">
            מחיקת המודעה היא פעולה בלתי הפיכה. לא ניתן למחוק מודעה עם הזמנות פעילות.
          </p>
        </CardHeader>
        <CardContent>
          {error && deleting && <Alert variant="error" className="mb-3">{error}</Alert>}
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            disabled={deleting}
            onClick={async () => {
              if (!window.confirm(`למחוק את המודעה "${listingTitle}"? פעולה זו בלתי הפיכה.`)) return;
              setDeleting(true);
              setError(null);
              try {
                const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  setError(err?.error ?? "שגיאה במחיקה");
                  return;
                }
                router.push("/owner");
              } catch {
                setError("שגיאה במחיקה");
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "מוחק..." : "מחק מודעה"}
          </Button>
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
