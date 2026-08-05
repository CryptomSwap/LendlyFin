"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

const PRIMARY_BTN =
  "w-full sm:w-auto rounded-full bg-[#1A8C6A] font-sans font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:bg-[#167A5C] hover:-translate-y-[2px] transition-all duration-300";

export function LeaveReviewForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("נא לבחור דירוג 1–5");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, body: body.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "שגיאה בשליחת הביקורת");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
      <div className="mb-4">
        <h2 className="font-sans text-base font-bold text-black">השאר ביקורת</h2>
        <p className="font-assistant text-[14px] text-[#888888] mt-1">
          דירוגך עוזר לאחרים להכיר מלווים ושוכרים אמינים.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
        <div className="form-group">
          <Label className="mb-2 block">דירוג (1–5 כוכבים)</Label>
          <div className="flex gap-1" role="group" aria-label="בחר דירוג">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hovered || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A8C6A] focus:ring-offset-2 transition-colors"
                  aria-label={`${n} כוכבים`}
                  aria-pressed={rating === n}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      active ? "fill-[#1A8C6A] text-[#1A8C6A]" : "fill-transparent text-[#888888]"
                    }`}
                    stroke="currentColor"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="form-group">
          <Label htmlFor="review-body">טקסט (אופציונלי)</Label>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="איך הייתה החוויה?"
            className="input-base w-full min-h-[80px] resize-y"
            dir="rtl"
            disabled={sending}
            aria-label="תוכן הביקורת"
          />
        </div>
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" disabled={sending} className={PRIMARY_BTN}>
          {sending ? "שולח..." : "שלח ביקורת"}
        </Button>
      </form>
    </div>
  );
}
