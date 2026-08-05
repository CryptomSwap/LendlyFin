"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Upload } from "lucide-react";
import { HeroCategories } from "@/components/home/HeroCategories";
import HowItWorks from "@/components/home/HowItWorks";
import RedesignOwnerCTA from "@/components/home/RedesignOwnerCTA";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhyLendly } from "@/components/home/WhyLendly";
import ListingCard from "@/components/listing-card";
import RecommendationsSection from "@/components/home/RecommendationsSection";
import ScrollRevealTitle from "@/components/home/ScrollRevealTitle";
import { EmptyState } from "@/components/ui/empty-state";
import { FAQBlock } from "@/components/ui/faq-block";
import { HOME_FAQ_ITEMS } from "@/lib/copy/help-reassurance";
import type { CategoryListingCount, FeaturedListingItem } from "@/lib/listings";

const HERO_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const HERO_IMAGE = "/images/hero/camping-studio-v3.png";

type RedesignHomePageProps = {
  listings: FeaturedListingItem[];
  categoryCounts: CategoryListingCount[];
  publishHref: string;
  isSignedIn: boolean;
};

export function RedesignHomePage({
  listings,
  categoryCounts,
  publishHref,
  isSignedIn,
}: RedesignHomePageProps) {
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

  const heroCtaLabel = isSignedIn ? "פרסום מודעה להשכרה" : "התחברו עם Google";

  return (
    <div className="bg-white pb-8 md:pb-0">
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

      <section
        dir="ltr"
        className="relative w-full overflow-visible bg-[#F9EFE8] pb-1 md:overflow-visible"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-contain object-left-bottom md:object-left"
          />
        </div>

        <div className="relative mx-auto max-w-[1420px] px-5 pb-12 pt-24 md:min-h-[min(92vh,820px)] md:px-8 md:pb-0 md:pt-28 lg:px-5">
          <div
            dir="rtl"
            className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-5 text-center pointer-events-none md:absolute md:inset-0 md:mx-auto md:max-w-none md:px-16"
          >
            <h1 className="w-full text-center leading-[1.15]">
              <span
                className="block font-sans text-[40px] font-black text-black transition-all duration-700 md:text-[64px]"
                style={{
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateY(0)" : "translateY(24px)",
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
                  transform: heroReady ? "translateY(0)" : "translateY(24px)",
                  transitionTimingFunction: HERO_EASE,
                  transitionDelay: "150ms",
                }}
              >
                כשאפשר
              </span>
              <span
                className="block font-sans text-[40px] font-black text-[#1A8C6A] transition-all duration-700 md:text-[64px]"
                style={{
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "translateY(0)" : "translateY(24px)",
                  transitionTimingFunction: HERO_EASE,
                  transitionDelay: "300ms",
                }}
              >
                לשכור?
              </span>
            </h1>

            <p
              className="w-full max-w-xl text-center font-assistant text-[18px] text-[#555555] transition-opacity duration-[600ms] ease-in-out md:text-[20px]"
              style={{
                opacity: heroReady ? 1 : 0,
                transitionDelay: "500ms",
              }}
            >
              פשוט לשכור ציוד בסביבה, או להשכיר את שלך
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-3"
              style={{
                opacity: heroReady ? 1 : 0,
                transitionDelay: heroReady ? "700ms" : "0ms",
              }}
            >
              <Link
                href="/search"
                className="glide-slide-button pointer-events-auto shrink-0 px-8 py-3.5 font-sans text-[16px] font-bold tracking-[-0.2px]"
              >
                <span className="glide-slide-button__label">חיפוש</span>
              </Link>
              <Link
                href={publishHref}
                className="glide-slide-button pointer-events-auto shrink-0 px-8 py-3.5 font-sans text-[16px] font-bold tracking-[-0.2px]"
              >
                <span className="glide-slide-button__label">{heroCtaLabel} ←</span>
              </Link>
            </div>
          </div>

          <div className="relative z-20 mt-10 flex w-full justify-center overflow-visible md:absolute md:right-0 md:top-1/2 md:mt-0 md:w-auto md:-translate-y-1/2 md:justify-end lg:right-2">
            <HeroCategories counts={categoryCounts} />
          </div>
        </div>
      </section>

      <section dir="rtl" className="mx-auto w-full max-w-[1420px] px-5">
        <div className="flex flex-col items-start justify-between gap-4 pt-6 md:flex-row md:items-end">
          <ScrollRevealTitle className="font-sans text-[36px] font-black leading-none tracking-[-2px] text-black md:text-[48px]">
            🔥 הושכר לאחרונה
          </ScrollRevealTitle>
          <Link
            href="/search"
            className="glide-slide-button shrink-0 px-8 py-3.5 font-sans text-[16px] font-bold tracking-[-0.2px]"
          >
            <span className="glide-slide-button__label">כל ההשכרות ←</span>
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
                imageUrl={item.coverImageUrl ?? undefined}
                href={`/listing/${item.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <RecommendationsSection />
      <HowItWorks />

      <section dir="rtl" className="mx-auto w-full max-w-[1420px] px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <WhyLendly />
          <FAQBlock
            title="שאלות נפוצות"
            items={[...HOME_FAQ_ITEMS]}
            moreLink={{ href: "/help/faq", label: "כל השאלות והתשובות" }}
            className="border-black/10 shadow-none"
          />
        </div>
      </section>

      <RedesignOwnerCTA publishHref={publishHref} isSignedIn={isSignedIn} />

      <section dir="rtl" className="mx-auto w-full max-w-[1420px] px-5 pb-8">
        <TrustStrip />
      </section>

      <section dir="rtl" className="mx-auto w-full max-w-[1420px] px-5 pb-12" aria-label="פעולה ועזרה">
        <div className="rounded-[12px] border border-[#1A8C6A]/15 bg-[#F0FAF6] px-6 py-12 text-center md:px-10">
          <h2 className="font-sans text-[28px] font-black text-black md:text-[32px]">
            אז מה שוכב לך בבית?
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-[#1A8C6A] px-8 py-3.5 font-sans text-[16px] font-bold text-white"
            >
              <Search className="h-4 w-4" aria-hidden />
              חיפוש
            </Link>
            <Link
              href={publishHref}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-8 py-3.5 font-sans text-[16px] font-bold text-black"
            >
              <Upload className="h-4 w-4" aria-hidden />
              פרסום ציוד
            </Link>
            {isSignedIn && (
              <Link
                href="/owner"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-8 py-3.5 font-sans text-[16px] font-bold text-black"
              >
                ניהול הזמנות
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
