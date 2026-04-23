"use client";

import * as React from "react";
import Link from "next/link";
import { getCategoryDisplayLabel } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { ImageIcon, Star } from "lucide-react";

export interface ListingCardProps {
  title: string;
  pricePerDay: number;
  location: string;
  href: string;
  imageUrl?: string | null;
  category?: string | null;
  subcategory?: string | null;
  /** Optional compact size for carousels; default is default */
  size?: "default" | "compact";
  /** Cap image height so card is wider but not taller (e.g. homepage featured grid) */
  imageMaxHeight?: string;
  /** Owner review aggregate — shown as star + number when reviewsCount > 0 */
  reviewsCount?: number;
  averageRating?: number;
  className?: string;
}

export default function ListingCard({
  title,
  pricePerDay,
  location,
  href,
  imageUrl,
  category,
  subcategory,
  size = "default",
  imageMaxHeight,
  reviewsCount = 0,
  averageRating = 0,
  className,
}: ListingCardProps) {
  const isCompact = size === "compact";
  const [imgError, setImgError] = React.useState(false);
  const showImage = imageUrl && !imgError;
  const showRating = reviewsCount > 0;

  const metaParts = [
    category ? getCategoryDisplayLabel(category, subcategory ?? undefined) : null,
    location || null,
  ].filter(Boolean);
  const metaLine = metaParts.join(" · ");

  const ratingLabel = showRating
    ? `דירוג ממוצע ${averageRating.toFixed(1)}, ${reviewsCount} ביקורות`
    : undefined;

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-card border border-border bg-card",
        "shadow-card transition-all duration-200 hover:shadow-medium hover:border-primary/20",
        "active:scale-[0.99] cursor-pointer select-none",
        isCompact ? "max-w-[180px]" : "w-full",
        className
      )}
      dir="rtl"
    >
      {/* Image — full-bleed, aspect 4/3 (or fixed height when imageMaxHeight so card is bigger but not longer) */}
      <div
        className={cn(
          "relative w-full bg-muted overflow-hidden",
          isCompact && "aspect-[4/3] max-h-[100px]",
          !isCompact && !imageMaxHeight && "aspect-[4/3] min-h-[140px]",
          !isCompact && imageMaxHeight && "min-h-0"
        )}
        style={imageMaxHeight ? { height: imageMaxHeight } : undefined}
      >
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <ImageIcon className={cn(isCompact ? "h-8 w-8" : "h-12 w-12")} />
          </div>
        )}
      </div>

      {/* Content — title, metadata line, price block */}
      <div
        className={cn(
          "flex flex-col items-start text-right min-w-0 flex-1",
          isCompact ? "p-2 gap-0.5" : "px-4 pt-3 pb-4 gap-1.5"
        )}
      >
        <h3
          className={cn(
            "font-semibold text-foreground line-clamp-2 leading-snug min-w-0 w-full",
            isCompact ? "text-xs" : "text-base"
          )}
        >
          {title}
        </h3>
        {metaLine ? (
          <p
            className={cn(
              "text-muted-foreground truncate max-w-full min-w-0 w-full",
              isCompact ? "text-[10px]" : "text-xs"
            )}
          >
            {metaLine}
          </p>
        ) : null}
        {showRating ? (
          <p
            className={cn(
              "inline-flex items-center gap-1 text-primary font-medium tabular-nums",
              isCompact ? "text-[10px]" : "text-xs"
            )}
            aria-label={ratingLabel}
          >
            <Star
              className={cn(
                "shrink-0 fill-primary text-primary",
                isCompact ? "h-3 w-3" : "h-3.5 w-3.5"
              )}
              aria-hidden
            />
            <span>{averageRating.toFixed(1)}</span>
          </p>
        ) : null}
        {/* Price — distinct row, MVP-style bold primary + /יום muted */}
        <div
          className={cn(
            "flex items-baseline gap-0.5 w-full",
            isCompact ? "pt-0.5" : "pt-2 mt-0.5 border-t border-border"
          )}
        >
          <span
            className={cn(
              "font-bold text-primary",
              isCompact ? "text-xs" : "text-lg"
            )}
          >
            {formatMoneyIls(pricePerDay)}
          </span>
          <span
            className={cn(
              "text-muted-foreground font-normal",
              isCompact ? "text-[10px]" : "text-sm"
            )}
          >
            /יום
          </span>
        </div>
      </div>
    </Link>
  );
}
