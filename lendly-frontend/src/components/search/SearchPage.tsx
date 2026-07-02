"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Map, MapPin, Navigation, Search, Star } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import DesktopFooter from "@/components/layout/desktop-footer";
import QuickViewDrawer, { type QuickViewListing } from "@/components/search/QuickViewDrawer";

const MOCK_LISTINGS = [
  {
    id: "1",
    title: "מצלמת סוני A7III",
    category: "צילום וידאו",
    location: "תל אביב",
    pricePerDay: 120,
    deposit: 800,
    rating: 4.9,
    reviews: 76,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
    verified: true,
    responseTime: "מהיר",
    distance: 1.2,
  },
  {
    id: "2",
    title: "מקדחה מקצועית Bosch",
    category: "כלי עבודה",
    location: "רמת גן",
    pricePerDay: 45,
    deposit: 300,
    rating: 4.7,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
    verified: true,
    responseTime: "בינוני",
    distance: 3.4,
  },
  {
    id: "3",
    title: "אוהל קמפינג ל-4 אנשים",
    category: "קמפינג",
    location: "חיפה",
    pricePerDay: 80,
    deposit: 400,
    rating: 4.8,
    reviews: 54,
    image: "https://images.unsplash.com/photo-1504280390368-3971d53b4f93?w=600&q=80",
    verified: false,
    responseTime: "מהיר",
    distance: 12.1,
  },
  {
    id: "4",
    title: "סט תאורה לצילום",
    category: "צילום וידאו",
    location: "תל אביב",
    pricePerDay: 95,
    deposit: 500,
    rating: 4.6,
    reviews: 28,
    image: "https://images.unsplash.com/photo-1542038374058-f1ecc8b2c3fb?w=600&q=80",
    verified: true,
    responseTime: "מהיר",
    distance: 2.0,
  },
  {
    id: "5",
    title: 'מסור עגול Makita 7"',
    category: "כלי עבודה",
    location: "פתח תקווה",
    pricePerDay: 55,
    deposit: 250,
    rating: 4.5,
    reviews: 19,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
    verified: false,
    responseTime: "איטי",
    distance: 6.7,
  },
  {
    id: "6",
    title: "גיטרה אקוסטית Yamaha",
    category: "מוזיקה",
    location: "ירושלים",
    pricePerDay: 60,
    deposit: 350,
    rating: 5.0,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
    verified: true,
    responseTime: "מהיר",
    distance: 8.3,
  },
  {
    id: "7",
    title: "מזרן אוויר כפול",
    category: "קמפינג",
    location: "באר שבע",
    pricePerDay: 25,
    deposit: 100,
    rating: 4.4,
    reviews: 41,
    image: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600&q=80",
    verified: true,
    responseTime: "בינוני",
    distance: 18.5,
  },
  {
    id: "8",
    title: "מקרן Epson Full HD",
    category: "אירועים",
    location: "הרצליה",
    pricePerDay: 110,
    deposit: 600,
    rating: 4.8,
    reviews: 63,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
    verified: true,
    responseTime: "מהיר",
    distance: 4.5,
  },
  {
    id: "9",
    title: "אופני הרים Trek",
    category: "ספורט",
    location: "נתניה",
    pricePerDay: 70,
    deposit: 450,
    rating: 4.7,
    reviews: 37,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    verified: false,
    responseTime: "בינוני",
    distance: 9.2,
  },
];

type Listing = (typeof MOCK_LISTINGS)[number];

const CATEGORIES = [
  "הכל",
  "צילום וידאו",
  "כלי עבודה",
  "קמפינג",
  "אירועים",
  "ספורט",
  "מוזיקה",
] as const;

type SortOption = "newest" | "price-asc" | "price-desc" | "rating";
type ViewMode = "list" | "map";

const SORT_ARROW_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left 12px center",
} as const;

const SHIMMER_STYLE = {
  background: "linear-gradient(90deg, #C5CCD9 25%, #F7F6F3 50%, #C5CCD9 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
} as const;

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-black/8 bg-white">
      <div className="aspect-[4/3] w-full" style={SHIMMER_STYLE} />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-3/4 rounded-[4px]" style={SHIMMER_STYLE} />
        <div className="h-3 w-1/2 rounded-[4px]" style={SHIMMER_STYLE} />
        <div className="mt-1 h-3 w-1/3 rounded-[4px]" style={SHIMMER_STYLE} />
      </div>
    </div>
  );
}

function ListingResultCard({
  listing,
  onQuickView,
  proximityFirst,
}: {
  listing: Listing;
  onQuickView: () => void;
  proximityFirst: boolean;
}) {
  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-[8px] border border-black/8 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      onClick={onQuickView}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-assistant text-[11px] font-bold text-white backdrop-blur-sm">
          {listing.category}
        </span>
        <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <span className="font-sans text-[14px] font-black text-black">
            ₪{listing.pricePerDay}
          </span>
          <span className="font-assistant text-[11px] text-[#666666]"> / יום</span>
        </div>
        {proximityFirst && (
          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <span className="font-assistant text-[11px] font-bold text-black">
              {listing.distance} ק״מ
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 font-sans text-[15px] font-black leading-snug text-black">
          {listing.title}
        </h3>

        <p className="flex items-center gap-1 font-assistant text-[12px] text-[#666666]">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {listing.location}
        </p>

        {/* Trust meter — task 5 */}
        <div className="flex items-center gap-1.5 pt-1 font-sans text-[11px] font-normal text-[#6B7280]" dir="rtl">
          {listing.verified ? (
            <span>✓ מאומת</span>
          ) : (
            <span className="text-[#AAAAAA]">○ לא מאומת</span>
          )}
          <span className="h-3 w-px shrink-0 bg-[#E5E7EB]" />
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-[#1A8C6A] text-[#1A8C6A]" />
            {listing.rating.toFixed(1)} ({listing.reviews})
          </span>
          <span className="h-3 w-px shrink-0 bg-[#E5E7EB]" />
          <span>⚡ {listing.responseTime}</span>
        </div>
      </div>
    </article>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(true);
  const [proximityFirst, setProximityFirst] = useState(false);
  const [quickView, setQuickView] = useState<QuickViewListing | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filteredListings = useMemo(() => {
    let results = MOCK_LISTINGS.filter((listing) => {
      const matchesCategory =
        selectedCategory === "הכל" || listing.category === selectedCategory;
      const matchesQuery =
        !query ||
        listing.title.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    switch (sort) {
      case "price-asc":
        results = [...results].sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-desc":
        results = [...results].sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "rating":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    if (proximityFirst) {
      results = [...results].sort((a, b) => a.distance - b.distance);
    }

    return results;
  }, [selectedCategory, sort, query, proximityFirst]);

  const clearFilters = () => {
    setSelectedCategory("הכל");
    setSort("newest");
    setProximityFirst(false);
    router.push("/search");
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>

      <div className="pt-4">
        <Navbar />
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-20 border-b border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-[1420px] items-center gap-3 overflow-x-auto px-5 py-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={[
                "shrink-0 cursor-pointer rounded-full border px-4 py-2.5 min-h-[44px] flex items-center font-assistant text-[13px] font-semibold transition-colors",
                selectedCategory === category
                  ? "border-[#1A8C6A] bg-[#1A8C6A] text-white"
                  : "border-black/15 bg-white text-black hover:bg-black/5",
              ].join(" ")}
            >
              {category}
            </button>
          ))}

          {/* Proximity toggle — task 6 */}
          <button
            type="button"
            onClick={() => setProximityFirst((p) => !p)}
            className={[
              "shrink-0 cursor-pointer rounded-full border px-4 py-2.5 min-h-[44px] flex items-center gap-1.5 font-assistant text-[13px] font-semibold transition-colors",
              proximityFirst
                ? "border-[#1A8C6A] bg-[#1A8C6A] text-white"
                : "border-black/15 bg-white text-black hover:bg-black/5",
            ].join(" ")}
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            קרוב אליי
          </button>

          <span className="mx-1 h-5 w-px shrink-0 bg-black/15" aria-hidden />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="shrink-0 cursor-pointer appearance-none rounded-full border border-black/15 bg-white py-1.5 pl-8 pr-4 font-assistant text-[13px] font-semibold text-black outline-none"
            style={SORT_ARROW_STYLE}
            aria-label="מיון תוצאות"
          >
            <option value="newest">הכי חדשים</option>
            <option value="price-asc">מחיר נמוך</option>
            <option value="price-desc">מחיר: גבוה לנמוך</option>
            <option value="rating">דירוג</option>
          </select>

          <p className="mr-auto shrink-0 font-assistant text-[13px] text-[#666666]">
            {filteredListings.length === 1
              ? "1 פריט"
              : `${filteredListings.length} פריטים`}
          </p>

          <div className="flex shrink-0 items-center overflow-hidden rounded-[8px] border border-black/15">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 font-assistant text-[13px] font-semibold transition-colors",
                viewMode === "list"
                  ? "bg-black text-white"
                  : "bg-white text-[#666666] hover:bg-black/5",
              ].join(" ")}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              רשימה
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              aria-pressed={viewMode === "map"}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 font-assistant text-[13px] font-semibold transition-colors",
                viewMode === "map"
                  ? "bg-black text-white"
                  : "bg-white text-[#666666] hover:bg-black/5",
              ].join(" ")}
            >
              <Map className="h-4 w-4" aria-hidden />
              מפה
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1420px] px-5 py-8">
        {viewMode === "map" ? (
          <div className="flex h-[500px] flex-col items-center justify-center rounded-[8px] border border-black/10 bg-[#F5F5F0]">
            <Map className="h-8 w-8 text-[#CCCCCC]" aria-hidden />
            <p className="mt-2 font-assistant text-[14px] text-[#AAAAAA]">מפה תגיע בקרוב</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <motion.div
                  layout
                  key={listing.id}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <ListingResultCard
                    listing={listing}
                    onQuickView={() => setQuickView(listing)}
                    proximityFirst={proximityFirst}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center gap-4 py-24 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5">
                  <Search className="h-7 w-7 text-[#666666]" aria-hidden />
                </div>
                <h2 className="font-sans text-[20px] font-black text-black">
                  אין תוצאות לחיפוש זה
                </h2>
                <p className="font-assistant text-[14px] text-[#666666]">
                  נסו מילים אחרות או שנו סינון. או הציגו את כל המודעות.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-black/15 px-5 py-2 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
                >
                  הציגו את כל המודעות
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <DesktopFooter />

      {/* Quick-view drawer — task 4 */}
      <QuickViewDrawer listing={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
