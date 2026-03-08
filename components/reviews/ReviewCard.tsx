import { Star } from "lucide-react";

export interface ReviewCardProps {
  authorName: string;
  targetUserName: string;
  rating: number;
  body: string | null;
  createdAt: string;
  /** Optional, for list context */
  className?: string;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Display-only star rating (1–5). Uses Star icons for consistency. */
export function ReviewStars({ rating }: { rating: number }) {
  const value = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex gap-0.5" role="img" aria-label={`דירוג ${value} מתוך 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4 shrink-0"
          fill={n <= value ? "currentColor" : "none"}
          stroke="currentColor"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ReviewCard({
  authorName,
  targetUserName,
  rating,
  body,
  createdAt,
  className = "",
}: ReviewCardProps) {
  return (
    <article
      className={`rounded-xl border border-border bg-card p-4 shadow-soft ${className}`}
      dir="rtl"
    >
      <div className="flex flex-wrap items-center gap-2 gap-y-1">
        <p className="font-medium text-foreground">
          {authorName} דירג/ה את {targetUserName}
        </p>
        <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-primary">
        <ReviewStars rating={rating} />
        <span className="text-sm font-medium text-foreground">{rating}/5</span>
      </div>
      {body && (
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {body}
        </p>
      )}
    </article>
  );
}
