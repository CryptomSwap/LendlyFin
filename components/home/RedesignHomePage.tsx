"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingNavbar from "@/components/home/MarketingNavbar";
import { HeroCategories } from "@/components/home/HeroCategories";
import HowItWorks from "@/components/home/HowItWorks";
import OwnerCTA from "@/components/home/OwnerCTA";
import RedesignFooter from "@/components/layout/redesign-footer";
import TrustStrip from "@/components/home/TrustStrip";
import ListingCard from "@/components/listing-card";
import RecommendationsSection from "@/components/home/RecommendationsSection";
import ScrollRevealTitle from "@/components/home/ScrollRevealTitle";
import { EmptyState } from "@/components/ui/empty-state";
import type { FeaturedListingItem } from "@/lib/listings";

const HERO_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type RedesignHomePageProps = {
  listings: FeaturedListingItem[];
  publishHref: string;
};

export function RedesignHomePage({ listings, publishHref }: RedesignHomePageProps) {
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    setHeroReady(true);
  }, []);

  useEffect(() => {
    const href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0&display=swap";
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pt-4 pb-8 md:pb-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .hero-categories-scroll {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .hero-categories-scroll::-webkit-scrollbar {
              display: none;
            }
            .hero-material-icon {
              font-family: "Material Symbols Rounded", sans-serif;
              font-weight: normal;
              font-style: normal;
              display: inline-block;
              line-height: 1;
              text-transform: none;
              letter-spacing: normal;
              word-wrap: normal;
              white-space: nowrap;
              direction: ltr;
              -webkit-font-smoothing: antialiased;
              font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 20;
            }
          `,
        }}
      />

      <MarketingNavbar />

      <section dir="ltr" className="relative w-full overflow-x-hidden bg-[#F7F6F3]">
        <div className="relative mx-auto flex min-h-[420px] max-w-[1420px] flex-col items-stretch md:h-[520px] md:flex-row md:items-start">
          <div
            dir="rtl"
            className="flex w-full flex-col items-end justify-start gap-5 px-5 pb-10 pt-10 md:w-[70%] md:pl-[60px] md:pr-8 md:pt-14"
          >
            <h1 className="w-full text-right leading-[1.15]">
              <span
                className="block font-sans text-[40px] font-black text-black transition-all duration-700 md:text-[64px]"
                style={{
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateX(0)" : "translateX(40px)",
                  transitionTimingFunction: HERO_EASE,
                  transitionDelay: "0ms",
                }}
              >
                למה לקנות
              </span>
              <span
                className="block font-sans text-[40px] font-black text-black transition-all duration-700 md:text-[64px]"
                style={{
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateX(0)" : "translateX(40px)",
                  transitionTimingFunction: HERO_EASE,
                  transitionDelay: "150ms",
                }}
              >
                אם אפשר
              </span>
              <span
                className="block font-sans text-[40px] font-black text-[#1A8C6A] transition-all duration-700 md:text-[64px]"
                style={{
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateX(0)" : "translateX(40px)",
                  transitionTimingFunction: HERO_EASE,
                  transitionDelay: "300ms",
                }}
              >
                להשכיר?
              </span>
            </h1>

            <p
              className="w-full text-right font-assistant text-[18px] text-[#888888] transition-opacity duration-[600ms] ease-in-out md:text-[20px]"
              style={{
                opacity: heroReady ? 1 : 0,
                transitionDelay: "500ms",
              }}
            >
              השאל, השכר, וחסוך — בקהילה שלך
            </p>

            <Link
              href={publishHref}
              className="rounded-full bg-[#1A8C6A] px-10 py-4 font-sans text-[17px] font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_32px_rgba(26,140,106,0.45)]"
              style={{
                transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
                opacity: heroReady ? 1 : 0,
                transitionProperty: "opacity, transform, box-shadow",
                transitionDelay: heroReady ? "700ms" : "0ms",
              }}
            >
              התחל להשכיר ←
            </Link>
          </div>

          <HeroCategories />
        </div>
      </section>

      <section dir="rtl" className="mx-auto w-full max-w-[1420px] px-5">
        <div className="flex flex-col items-start justify-between gap-4 pt-6 md:flex-row md:items-end">
          <ScrollRevealTitle className="font-sans text-[36px] font-black leading-none tracking-[-2px] text-black md:text-[48px]">
            הושכר לאחרונה
          </ScrollRevealTitle>
          <Link
            href="/search"
            className="glide-slide-button shrink-0 px-8 py-3.5 font-sans text-[16px] font-bold tracking-[-0.2px]"
          >
            <span className="glide-slide-button__label">עבור אל לוח ההשכרות ←</span>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="אין עדיין מודעות"
              subtitle="בקרוב יופיעו כאן השכרות. בינתיים חפשו לפי קטגוריה."
              ctaLabel="חפשו השכרות"
              ctaHref="/search"
              variant="full"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-3 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                title={item.title}
                category={item.category}
                subcategory={item.subcategory}
                location={item.city}
                pricePerDay={item.pricePerDay}
                averageRating={item.averageRating}
                reviewsCount={item.reviewsCount}
                imageUrl={item.images?.[0]?.url}
                href={`/listing/${item.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <RecommendationsSection />
      <HowItWorks />
      <OwnerCTA />
      <TrustStrip />
      <RedesignFooter />
    </div>
  );
}
