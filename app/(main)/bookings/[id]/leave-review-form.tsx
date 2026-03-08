"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

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
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">השאר ביקורת</CardTitle>
        <p className="text-sm text-muted-foreground">
          דירוגך עוזר לאחרים להכיר מלווים ושוכרים אמינים.
        </p>
      </CardHeader>
      <CardContent>
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
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                    aria-label={`${n} כוכבים`}
                    aria-pressed={rating === n}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        active ? "fill-primary text-primary" : "fill-transparent text-muted-foreground"
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
          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? "שולח..." : "שלח ביקורת"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
