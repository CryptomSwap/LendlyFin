"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Star } from "lucide-react";
import { getCategoryDisplayLabel } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const STOCK_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504280390368-3971d53b4f93?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1581147036324-c1c8e3a8d0e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=80",
];

function getDeterministicFallbackImage(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return STOCK_FALLBACK_IMAGES[hash % STOCK_FALLBACK_IMAGES.length];
}

export interface ListingCardProps {
  title: string;
  pricePerDay: number;
  location: string;
  href: string;
  imageUrl?: string | null;
  category?: string | null;
  subcategory?: string | null;
  size?: "default" | "compact";
  imageMaxHeight?: string;
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
  const fallbackImageUrl = React.useMemo(
    () => getDeterministicFallbackImage(`${title}:${href}`),
    [title, href]
  );
  const resolvedImageUrl = imgError ? fallbackImageUrl : (imageUrl ?? fallbackImageUrl);
  const showPlaceholder = !resolvedImageUrl || imgError;
  const categoryLabel = category
    ? getCategoryDisplayLabel(category, subcategory ?? undefined)
    : null;
  const metadataParts = [location, categoryLabel].filter(Boolean);
  const metadata = metadataParts.join(" · ");

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[8px] border border-transparent bg-white p-2 pb-4 transition-[border-color,box-shadow] duration-300 ease-in-out hover:border-black/15 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]",
        isCompact ? "max-w-[180px]" : "w-full",
        className
      )}
      dir="rtl"
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden rounded-[10px] transition-[aspect-ratio,transform] duration-300 ease-in-out aspect-[4/3] group-hover:aspect-[4/2.8] group-hover:-translate-y-0.5",
          isCompact && "aspect-[4/3] max-h-[100px] group-hover:aspect-[4/3] group-hover:translate-y-0"
        )}
        style={imageMaxHeight ? { height: imageMaxHeight, aspectRatio: "auto" } : undefined}
      >
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center bg-[#F0FAF6]">
            <Package className="h-10 w-10 text-[#1A8C6A]" aria-hidden />
          </div>
        ) : (
          <Image
            src={resolvedImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        )}
      </div>

      <div
        className={cn(
          "shrink-0 px-[14px] pb-3 pt-3 transition-transform duration-300 ease-in-out group-hover:-translate-y-1",
          isCompact && "px-2 pb-2 pt-2 group-hover:translate-y-0"
        )}
      >
        {metadata ? (
          <p className="font-assistant text-[11px] text-[#888888]">{metadata}</p>
        ) : null}

        <p
          className={cn(
            "mt-0.5 line-clamp-2 font-sans font-black leading-[1.1] tracking-[-0.5px] text-black",
            isCompact ? "text-xs" : "text-[16px]"
          )}
        >
          {title}
        </p>

        <div className="mt-1.5 flex items-center gap-1.5 font-sans text-[11px] font-normal text-[#6B7280]">
          {reviewsCount > 0 ? (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-[#1A8C6A] text-[#1A8C6A]" />
              {averageRating.toFixed(1)} ({reviewsCount})
            </span>
          ) : (
            <span className="text-[#AAAAAA]">אין ביקורות</span>
          )}
        </div>

        <p className="mt-1.5 flex items-baseline gap-1">
          <span className={cn("font-sans font-black text-black", isCompact ? "text-sm" : "text-[20px]")}>
            {formatMoneyIls(pricePerDay)}
          </span>
          <span className="font-assistant text-[13px] text-[#888888]">/ יום</span>
        </p>
      </div>

      {!isCompact ? (
        <div className="shrink-0 px-[14px]" dir="rtl">
          <div className="flex h-9 items-end justify-start overflow-hidden">
            <span className="inline-flex translate-y-2 items-center justify-center gap-1.5 rounded bg-[#1A8C6A] px-4 py-2 font-sans text-[13px] font-bold text-white opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              להשכרה
              <ArrowLeft size={14} strokeWidth={2.25} aria-hidden />
            </span>
          </div>
        </div>
      ) : null}
    </Link>
  );
}
