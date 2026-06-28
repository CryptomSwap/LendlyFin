"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Star } from "lucide-react";

export interface ListingCardProps {
  title: string;
  pricePerDay: number;
  location: string;
  href: string;
  imageUrl?: string | null;
  category?: string | null;
  rating?: number;
  reviewsCount?: number;
  verified?: boolean;
  responseTime?: "מהיר" | "בינוני" | "איטי";
}

export default function ListingCard({
  title,
  pricePerDay,
  location,
  href,
  imageUrl,
  category,
  rating = 0,
  reviewsCount = 0,
  verified = false,
  responseTime = "מהיר",
}: ListingCardProps) {
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !imageUrl || imageError;
  const metadataParts = [location, category].filter(Boolean);
  const metadata = metadataParts.join(" · ");

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[8px] border border-transparent bg-white p-2 pb-4 transition-[border-color,box-shadow] duration-300 ease-in-out hover:border-black/15 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
    >
      <div className="relative w-full shrink-0 overflow-hidden rounded-[10px] transition-[aspect-ratio,transform] duration-300 ease-in-out aspect-[4/3] group-hover:aspect-[4/2.8] group-hover:-translate-y-0.5">
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center bg-[#F0FAF6]">
            <Package className="h-10 w-10 text-[#1A8C6A]" aria-hidden />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      <div
        className="shrink-0 px-[14px] pb-3 pt-3 transition-transform duration-300 ease-in-out group-hover:-translate-y-1"
        dir="rtl"
      >
        {metadata ? (
          <p className="font-assistant text-[11px] text-[#888888]">{metadata}</p>
        ) : null}

        <p className="mt-0.5 line-clamp-2 font-sans text-[16px] font-black leading-[1.1] tracking-[-0.5px] text-black">
          {title}
        </p>

        {/* Trust meter */}
        <div className="mt-1.5 flex items-center gap-1.5 font-sans text-[11px] font-normal text-[#6B7280]">
          {verified ? (
            <span>✓ מאומת</span>
          ) : (
            <span className="text-[#AAAAAA]">○ לא מאומת</span>
          )}
          <span className="h-3 w-px shrink-0 bg-[#E5E7EB]" />
          {reviewsCount > 0 ? (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-[#1A8C6A] text-[#1A8C6A]" />
              {rating.toFixed(1)} ({reviewsCount})
            </span>
          ) : (
            <span className="text-[#AAAAAA]">אין ביקורות</span>
          )}
          <span className="h-3 w-px shrink-0 bg-[#E5E7EB]" />
          <span>⚡ {responseTime}</span>
        </div>

        <p className="mt-1.5 flex items-baseline gap-1">
          <span className="font-sans text-[20px] font-black text-black">
            ₪{pricePerDay}
          </span>
          <span className="font-assistant text-[13px] text-[#888888]">/ יום</span>
        </p>
      </div>

      <div className="shrink-0 px-[14px]" dir="rtl">
        <div className="flex h-9 items-end justify-start overflow-hidden">
          <span className="inline-flex translate-y-2 items-center justify-center gap-1.5 rounded bg-[#1A8C6A] px-4 py-2 font-sans text-[13px] font-bold text-white opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            להשכרה
            <ArrowLeft size={14} strokeWidth={2.25} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
