"use client";

import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";

interface ProductCardProps {
  name: string;
  category: string;
  city: string;
  price: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  verified?: boolean;
  responseTime?: "מהיר" | "בינוני" | "איטי";
}

export default function ProductCard({
  name,
  category,
  city,
  price,
  rating,
  reviewsCount,
  imageUrl,
  verified = false,
  responseTime = "מהיר",
}: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[8px] border border-transparent bg-white p-2 pb-4 transition-[border-color,box-shadow] duration-300 ease-in-out hover:border-black/15 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
      <div className="relative w-full shrink-0 overflow-hidden rounded-[10px] transition-[aspect-ratio,transform] duration-300 ease-in-out aspect-[4/3] group-hover:aspect-[4/2.8] group-hover:-translate-y-0.5">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>

      <div
        className="shrink-0 px-[14px] pb-3 pt-3 transition-transform duration-300 ease-in-out group-hover:-translate-y-1"
        dir="rtl"
      >
        <p className="font-assistant text-[11px] font-normal tracking-[0.3px] text-[#888]">
          {city} · {category}
        </p>

        <p className="mt-0.5 line-clamp-2 font-sans text-[16px] font-black leading-[1.1] tracking-[-0.5px] text-black">
          {name}
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
            ₪{price}
          </span>
          <span className="font-assistant text-[13px] font-normal text-[#888]">
            / יום
          </span>
        </p>
      </div>

      <div className="shrink-0 px-[14px]" dir="rtl">
        <div className="flex h-9 items-end justify-start overflow-hidden">
          <button
            type="button"
            className="inline-flex translate-y-2 items-center justify-center gap-1.5 rounded bg-[#1A8C6A] px-4 py-2 font-sans text-[13px] font-bold text-white opacity-0 transition-[opacity,transform] duration-300 ease-out hover:opacity-90 group-hover:translate-y-0 group-hover:opacity-100"
          >
            להשכרה
            <ArrowLeft size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
