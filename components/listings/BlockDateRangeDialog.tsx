"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export interface BlockDateRangeDialogProps {
  open: boolean;
  onClose: () => void;
  onBlock: (startDate: string, endDate: string) => Promise<void>;
  /** Initial month to suggest (YYYY-MM) */
  suggestedMonth?: string;
}

export default function BlockDateRangeDialog({
  open,
  onClose,
  onBlock,
  suggestedMonth,
}: BlockDateRangeDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("נא לבחור תאריך התחלה וסיום");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setError("תאריכים לא תקינים");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onBlock(startDate, endDate);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהוספת טווח");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-dialog-title"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-lg"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="block-dialog-title" className="text-lg font-semibold">
            חסימת תאריכים
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 -m-1 rounded-lg hover:bg-muted text-muted-foreground touch-manipulation"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          התאריכים שבטווח לא יהיו זמינים להזמנה. הזמנות קיימות לא יושפעו.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="form-group">
            <Label htmlFor="block-start">מתאריך</Label>
            <Input
              id="block-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="w-full"
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <Label htmlFor="block-end">עד תאריך</Label>
            <Input
              id="block-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="w-full"
              disabled={submitting}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              ביטול
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "מוסיף..." : "חסום טווח"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
