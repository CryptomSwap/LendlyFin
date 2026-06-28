"use client";

import { useEffect, useState } from "react";
import { HeroCategories } from "@/components/HeroCategories";
import HowItWorks from "@/components/HowItWorks";
import OwnerCTA from "@/components/OwnerCTA";
import Footer from "@/components/Footer";
import TrustStrip from "@/components/TrustStrip";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import RecommendationsSection from "@/components/RecommendationsSection";
import ScrollRevealTitle from "@/components/ScrollRevealTitle";

const PRODUCTS = [
  { title: "מצלמת סוני A7III", category: "צילום וידאו", location: "תל אביב", pricePerDay: 120, rating: 4.9, reviewsCount: 76, imageUrl: "/images/products/camera.webp", href: "/listing/1" },
  { title: "אוהל משפחתי ל-6 אנשים", category: "קמפינג", location: "חיפה", pricePerDay: 80, rating: 4.2, reviewsCount: 41, imageUrl: "/images/products/tent.webp", href: "/listing/2" },
  { title: "מקדחה מקיטה 18V", category: "כלי עבודה", location: "ראשון לציון", pricePerDay: 45, rating: 4.8, reviewsCount: 58, imageUrl: "/images/products/drill.webp", href: "/listing/3" },
  { title: "קורקינט חשמלי Xiaomi", category: "תחבורה", location: "תל אביב", pricePerDay: 90, rating: 3.9, reviewsCount: 33, imageUrl: "/images/products/scooter.webp", href: "/listing/4" },
  { title: "גיטרה אקוסטית Yamaha", category: "מוזיקה", location: "ירושלים", pricePerDay: 55, rating: 4.9, reviewsCount: 64, imageUrl: "/images/products/guitar.webp", href: "/listing/5" },
  { title: "עדשת 85mm f/1.4", category: "צילום וידאו", location: "הרצליה", pricePerDay: 65, rating: 4.8, reviewsCount: 29, imageUrl: "/images/products/lens.webp", href: "/listing/6" },
];

const HERO_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function Home() {
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
    <main className="min-h-screen bg-white pt-4">
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

      <Navbar />

      <section
        dir="ltr"
        className="relative w-full overflow-x-hidden bg-[#F7F6F3]"
      >
        <div className="relative mx-auto flex h-[520px] max-w-[1420px] flex-row items-start">
          <div
            dir="rtl"
            className="flex w-[70%] flex-col items-end justify-start gap-5 pb-10 pl-[60px] pr-8 pt-14"
          >
          <h1 className="w-full text-right leading-[1.15]">
            <span
              className="block font-sans text-[64px] font-black text-black transition-all duration-700"
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
              className="block font-sans text-[64px] font-black text-black transition-all duration-700"
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
              className="block font-sans text-[64px] font-black text-[#1A8C6A] transition-all duration-700"
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
            className="w-full text-right font-assistant text-[20px] text-[#888888] transition-opacity duration-[600ms] ease-in-out"
            style={{
              opacity: heroReady ? 1 : 0,
              transitionDelay: "500ms",
            }}
          >
            השאל, השכר, וחסוך — בקהילה שלך
          </p>

          <button
            type="button"
            className="rounded-full bg-[#1A8C6A] px-10 py-4 font-sans text-[17px] font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_32px_rgba(26,140,106,0.45)]"
            style={{
              transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
              opacity: heroReady ? 1 : 0,
              transitionProperty: "opacity, transform, box-shadow",
              transitionDelay: heroReady ? "700ms" : "0ms",
            }}
          >
            התחל להשכיר ←
          </button>
          </div>

          <HeroCategories />
        </div>
      </section>

      {/* Recently Rented Section */}
      <section dir="rtl" className="mx-auto w-full max-w-[1420px] px-5">
        <div className="flex items-end justify-between pt-6">
          <ScrollRevealTitle className="font-sans text-[48px] font-black leading-none tracking-[-2px] text-black">
            הושכר לאחרונה
          </ScrollRevealTitle>
          <a
            href="/search"
            className="glide-slide-button shrink-0 px-8 py-3.5 font-sans text-[16px] font-bold tracking-[-0.2px]"
          >
            <span className="glide-slide-button__label">עבור אל לוח ההשכרות ←</span>
          </a>
        </div>

        <div className="grid grid-cols-4 items-start gap-3 py-8">
          {PRODUCTS.map((product) => (
            <ListingCard
              key={product.title}
              title={product.title}
              category={product.category}
              location={product.location}
              pricePerDay={product.pricePerDay}
              rating={product.rating}
              reviewsCount={product.reviewsCount}
              imageUrl={product.imageUrl}
              href={product.href}
            />
          ))}
        </div>
      </section>

      <RecommendationsSection />

      <HowItWorks />

      <OwnerCTA />

      <TrustStrip />

      <Footer />
    </main>
  );
}
