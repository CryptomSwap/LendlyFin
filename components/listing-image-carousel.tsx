"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ListingImageCarousel({
  images,
  alt,
}: {
  images: { url: string }[];
  alt: string;
}) {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div
        className="aspect-[4/3] min-h-[220px] lg:aspect-[16/10] bg-muted rounded-card flex items-center justify-center text-muted-foreground"
        aria-label="אין תמונות"
      >
        <ImageIcon className="h-14 w-14" aria-hidden />
      </div>
    );
  }

  const current = images[idx]?.url;
  const hasMultiple = images.length > 1;
  const goPrev = () => setIdx((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () => setIdx((i) => (i >= images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3" dir="rtl">
      <div className="relative aspect-[4/3] min-h-[220px] lg:aspect-[16/10] overflow-hidden bg-muted rounded-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt}
          className="w-full h-full object-cover"
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute start-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="תמונה קודמת"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute end-2 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="תמונה הבאה"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <div className="absolute bottom-2 start-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`עבור לתמונה ${i + 1}`}
                  aria-current={i === idx ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
          {images.map((im, i) => (
            <button
              key={im.url + i}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "h-14 w-14 lg:h-16 lg:w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                i === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              aria-label={`תמונה ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
