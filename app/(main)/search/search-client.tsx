"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ListingCard from "@/components/listing-card";
import ListingsMap from "@/components/listings-map";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { Alert } from "@/components/ui/alert";
import { ListingCardSkeleton } from "@/components/ui/listing-card-skeleton";
import { Button } from "@/components/ui/button";
import Chip from "@/components/ui/chips";
import { SearchHero } from "@/components/search/SearchHero";
import Logo from "@/components/logo";
import { SurfaceCard, SEARCH_PAGE_INNER_CLASS } from "@/components/layout";
import { CATEGORY_LIST, getCategoryLabel, getSubcategoriesForCategory } from "@/lib/constants";
import { getListingTrustBadges } from "@/lib/trust/badges";
import { cn } from "@/lib/utils";
import { HOME_TESTIMONIALS } from "@/lib/copy/help-reassurance";
import { ChevronLeft, ChevronRight, LayoutList, Map, Search, SearchX, Star } from "lucide-react";

type SearchListing = {
  id: string;
  title: string;
  pricePerDay: number;
  city: string;
  category: string;
  subcategory?: string | null;
  lat: number | null;
  lng: number | null;
  images: { url: string }[];
  owner?: { id: string; kycStatus?: string | null; phoneNumber?: string | null } | null;
  completedBookingsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
};

const inputBase = "input-base";

/** Max price slider: 0 = no limit, else 50–2000 NIS step 50 */
const MAX_PRICE_SLIDER_CAP = 2000;
const MAX_PRICE_STEP = 50;

export default function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [subcategory, setSubcategory] = useState(params.get("subcategory") ?? "");
  const [min, setMin] = useState(""); // no min in UI; kept for URL/clear compatibility
  const [max, setMax] = useState(params.get("max") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");
  const [view, setView] = useState((params.get("view") ?? "list") as "list" | "map");

  const maxSliderValue = max !== "" && Number.isFinite(Number(max)) ? Math.min(MAX_PRICE_SLIDER_CAP, Math.max(0, Number(max))) : 0;

  const [items, setItems] = useState<SearchListing[]>([]);
  const [page, setPage] = useState(Number(params.get("page") ?? 1));
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestReq = useRef(0);

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCategory(params.get("category") ?? "");
    setSubcategory(params.get("subcategory") ?? "");
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
    setSort(params.get("sort") ?? "newest");
    setView((params.get("view") ?? "list") as "list" | "map");
    setPage(Number(params.get("page") ?? 1));
  }, [params]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchResults(page, true);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, subcategory, min, max, sort, page]);

  async function fetchResults(
    p: number,
    reset = false,
    overrides?: { q?: string; category?: string; subcategory?: string; min?: string; max?: string; sort?: string }
  ) {
    const requestId = ++latestReq.current;
    setLoading(true);
    setError(null);
    if (reset) setHasMore(true);

    const qVal = overrides?.q ?? q;
    const catVal = overrides?.category ?? category;
    const subVal = overrides?.subcategory ?? subcategory;
    const minVal = overrides?.min ?? min;
    const maxVal = overrides?.max ?? max;
    const sortVal = overrides?.sort ?? sort;

    const qs = new URLSearchParams({
      q: qVal,
      page: String(p),
      ...(catVal && { category: catVal }),
      ...(catVal && subVal && { subcategory: subVal }),
      ...(sortVal && { sort: sortVal }),
    });
    if (minVal !== "") qs.set("min", minVal);
    if (maxVal !== "") qs.set("max", maxVal);

    let data: any;
    try {
      const res = await fetch(`/api/listings/search?${qs.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Search API failed (${res.status}): ${text}`);
      }
      data = await res.json();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      if (reset) setItems([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (requestId !== latestReq.current) return;

    const nextItems: SearchListing[] = Array.isArray(data.items) ? data.items : [];
    setItems((prev) => (reset ? nextItems : [...prev, ...nextItems]));
    setHasMore(Boolean(data.hasMore));
    setPage(p);
    setLoading(false);

    if (reset) {
      const urlQs = new URLSearchParams(qs);
      urlQs.set("view", view);
      const nextUrl = `/search?${urlQs.toString()}`;
      const currentUrl = `/search?${params.toString()}`;
      if (nextUrl !== currentUrl) router.replace(nextUrl);
    }
  }

  const showEmpty = !loading && !error && items.length === 0;

  const syncViewToUrl = (newView: "list" | "map") => {
    const qs = new URLSearchParams(params.toString());
    qs.set("view", newView);
    router.replace(`/search?${qs.toString()}`, { scroll: false });
  };

  const resultsCountLabel =
    loading && items.length === 0
      ? "טוען..."
      : `${items.length} ${items.length === 1 ? "פריט" : "פריטים"}`;

  const categoryTitle = category ? getCategoryLabel(category) : "כל הקטגוריות";
  const categoryDescription = category
    ? `השכירו ציוד בקטגוריית ${categoryTitle} — גלו מודעות מקומיות ובחרו לפי מחיר ומיקום.`
    : "גלו ציוד להשכרה מכל הקטגוריות — כלי עבודה, צילום, קמפינג, מוזיקה ועוד.";

  const viewToggle = (
    <div className="flex rounded-card border border-border/80 overflow-hidden bg-card shadow-soft">
      <button
        type="button"
        onClick={() => {
          setView("list");
          syncViewToUrl("list");
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
          view === "list"
            ? "bg-[var(--mint-accent)] text-white"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
        aria-pressed={view === "list"}
      >
        <LayoutList className="h-4 w-4" aria-hidden />
        רשימה
      </button>
      <button
        type="button"
        onClick={() => {
          setView("map");
          syncViewToUrl("map");
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
          view === "map"
            ? "bg-[var(--mint-accent)] text-white"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
        aria-pressed={view === "map"}
      >
        <Map className="h-4 w-4" aria-hidden />
        מפה
      </button>
    </div>
  );

  const filterToolbarClass = cn(
    inputBase,
    "py-2 px-3 text-sm rounded-lg border-border/80 min-w-0 bg-card/80 backdrop-blur-sm"
  );

  return (
    <div className="space-y-0" dir="rtl">
      {/* ——— Search Hero: full-width to top and sides (main has no padding on /search) ——— */}
      <div className="w-full">
        <SearchHero
          title="מה בא לך להשכיר היום?"
          subtitle=""
        >
          {/* Search row: logo + search bar, same column width */}
          <div className="flex items-center gap-4 w-full">
            <Logo size={80} linkToHome className="hidden md:block shrink-0 [&_img]:brightness-0 [&_img]:invert [&_img]:opacity-95" />
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-soft flex-1 min-w-0 max-w-xl">
              <div className="relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none" aria-hidden />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                  placeholder="ציוד, כלים, מצלמות, קמפינג..."
                  className={cn(
                    inputBase,
                    "w-full ps-12 pe-4 py-3.5 md:py-4 rounded-none border-0 shadow-none text-base md:text-lg placeholder:text-white/60 focus:ring-0 bg-transparent text-white"
                  )}
                  aria-label="מילות חיפוש"
                />
              </div>
            </div>
          </div>
          {/* Category chips: horizontal scroll on mobile, wrap on desktop */}
          <div className="w-full px-0 md:px-0 -mx-4 md:mx-0">
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap px-4 md:flex-wrap md:overflow-visible md:whitespace-normal md:gap-x-3 md:gap-y-3 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href="/search" className="flex-shrink-0">
                <Chip label="הכל" variant="category" selected={!category} className="border-white/30 text-white bg-white/10 hover:bg-white/15" />
              </Link>
              {CATEGORY_LIST.map((c) => (
                <Link key={c.slug} href={`/search?category=${encodeURIComponent(c.slug)}`} className="flex-shrink-0">
                  <Chip label={c.labelHe} variant="category" selected={category === c.slug} className={category === c.slug ? "border-white/50 text-white bg-white/15" : "border-white/30 text-white/90 bg-white/5 hover:bg-white/10"} />
                </Link>
              ))}
            </div>
          </div>
        </SearchHero>
      </div>

      {/* ——— Results section: same inner container as hero for exact alignment ——— */}
      <div className="app-page-bg pt-6 md:pt-10 pb-6 md:pb-10">
        <div className={SEARCH_PAGE_INNER_CLASS}>
          {/* ——— Subcategory section: editorial hierarchy when category selected ——— */}
          {category && (
            <div className="border-s-2 border-[var(--mint-accent)]/30 ps-5 py-2 mb-8 md:mb-10">
              <h2 className="text-lg font-semibold text-foreground m-0">{categoryTitle}</h2>
              <p className="text-sm text-muted-foreground m-0 mt-2 leading-relaxed max-w-2xl">{categoryDescription}</p>
              {getSubcategoriesForCategory(category).length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-5">
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      !subcategory
                        ? "border-[var(--mint-accent)]/40 bg-[var(--mint-accent)]/10 text-[var(--mint-accent)]"
                        : "border-border/80 bg-card/60 text-muted-foreground hover:border-[var(--mint-accent)]/40 hover:bg-[var(--mint-accent)]/5 hover:text-foreground"
                    )}
                  >
                    הכל
                  </Link>
                  {getSubcategoriesForCategory(category).map((sub) => (
                    <Link
                      key={sub.key}
                      href={`/search?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(sub.slug)}`}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        subcategory === sub.slug
                          ? "border-[var(--mint-accent)]/40 bg-[var(--mint-accent)]/10 text-[var(--mint-accent)]"
                          : "border-border/80 bg-card/60 text-muted-foreground hover:border-[var(--mint-accent)]/40 hover:bg-[var(--mint-accent)]/5 hover:text-foreground"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ——— Results toolbar: mobile = 3 rows. Desktop: right = sort/category/price/clear, left = count + list/map toggle ——— */}
          <div
            className="flex flex-col gap-4 mb-6 border-b border-border/60 pb-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4"
            role="region"
            aria-label="תוצאות וסינון"
          >
            {/* Desktop: first = right in RTL (filters). Mobile: row 2. */}
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3 order-2 md:order-1">
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
                className={cn(filterToolbarClass, "w-full md:w-auto md:max-w-[11rem]")}
                aria-label="מיון"
              >
                <option value="newest">הכי חדשים</option>
                <option value="price">מחיר נמוך</option>
              </select>
              <select
                value={category}
                onChange={(e) => {
                  setPage(1);
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
                className={cn(filterToolbarClass, "w-full md:w-auto md:max-w-[11rem]")}
                aria-label="קטגוריה"
              >
                <option value="">כל הקטגוריות</option>
                {CATEGORY_LIST.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.labelHe}
                  </option>
                ))}
              </select>
              {category && getSubcategoriesForCategory(category).length > 0 && (
                <select
                  value={subcategory}
                  onChange={(e) => {
                    setPage(1);
                    setSubcategory(e.target.value);
                  }}
                  className={cn(filterToolbarClass, "w-full md:w-auto md:max-w-[11rem]")}
                  aria-label="תת-קטגוריה"
                >
                  <option value="">כל התת-קטגוריות</option>
                  {getSubcategoriesForCategory(category).map((sub) => (
                    <option key={sub.key} value={sub.slug}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="hidden md:flex items-center gap-2 w-40 min-w-0 shrink-0">
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE_SLIDER_CAP}
                  step={MAX_PRICE_STEP}
                  value={maxSliderValue}
                  onChange={(e) => {
                    setPage(1);
                    const v = Number(e.target.value);
                    setMax(v === 0 ? "" : String(v));
                  }}
                  className="flex-1 h-1.5 min-w-0 rounded-full appearance-none bg-muted accent-[var(--mint-accent)] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--mint-accent)] [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--mint-accent)] [&::-moz-range-thumb]:border-0"
                  aria-label="מחיר מקסימלי ליום"
                  aria-valuemin={0}
                  aria-valuemax={MAX_PRICE_SLIDER_CAP}
                  aria-valuenow={maxSliderValue}
                  aria-valuetext={maxSliderValue === 0 ? "ללא הגבלה" : `עד ${maxSliderValue} ₪`}
                />
                <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-14 text-end">
                  {maxSliderValue === 0 ? "ללא הגבלה" : `עד ₪${maxSliderValue}`}
                </span>
              </div>
              {(q || category || subcategory || min || max || sort !== "newest") && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setCategory("");
                    setSubcategory("");
                    setMin("");
                    setMax("");
                    setSort("newest");
                    setPage(1);
                    fetchResults(1, true, { q: "", category: "", subcategory: "", min: "", max: "", sort: "newest" });
                  }}
                  className="text-sm text-muted-foreground hover:text-[var(--mint-accent)] underline underline-offset-2 text-right md:text-start"
                >
                  נקה סינון
                </button>
              )}
            </div>

            {/* Desktop: second = left in RTL (count + toggle). Mobile: row 1. */}
            <div className="flex items-center justify-between gap-3 order-1 md:order-2">
              <span className="text-base font-medium text-foreground">{resultsCountLabel}</span>
              {viewToggle}
            </div>

            {/* Row 3 (mobile only): price slider */}
            <div className="flex items-center gap-2 min-w-0 w-full md:hidden">
              <input
                type="range"
                min={0}
                max={MAX_PRICE_SLIDER_CAP}
                step={MAX_PRICE_STEP}
                value={maxSliderValue}
                onChange={(e) => {
                  setPage(1);
                  const v = Number(e.target.value);
                  setMax(v === 0 ? "" : String(v));
                }}
                className="flex-1 h-1.5 min-w-0 rounded-full appearance-none bg-muted accent-[var(--mint-accent)] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--mint-accent)] [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--mint-accent)] [&::-moz-range-thumb]:border-0"
                aria-label="מחיר מקסימלי ליום"
                aria-valuemin={0}
                aria-valuemax={MAX_PRICE_SLIDER_CAP}
                aria-valuenow={maxSliderValue}
                aria-valuetext={maxSliderValue === 0 ? "ללא הגבלה" : `עד ${maxSliderValue} ₪`}
              />
              <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-14 text-end">
                {maxSliderValue === 0 ? "ללא הגבלה" : `עד ₪${maxSliderValue}`}
              </span>
            </div>
          </div>

          {/* ——— Two-column: listings | sidebar ——— */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,260px)] lg:gap-16 gap-10 items-start">
            {/* ——— MAIN: listings grid or map ——— */}
            <div className="min-w-0">
      {/* Error — soft card so it matches page language */}
      {error && (
        <Alert variant="error" className="break-words rounded-card shadow-soft border-border/80">
          <span className="font-medium">שגיאה בחיפוש</span>
          <p className="mt-1">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void fetchResults(1, true)}
          >
            נסה שוב
          </Button>
        </Alert>
      )}

      {/* Loading skeletons — list view (grid to match results) */}
      {view === "list" && loading && items.length === 0 && (
        <section aria-label="טוען תוצאות">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state — Search icon, clearer copy, CTA to show all */}
      {showEmpty && (
        <EmptyState
          icon={<SearchX className="h-12 w-12 text-muted-foreground" aria-hidden />}
          title="אין תוצאות לחיפוש זה"
          subtitle="נסו מילים אחרות או שנו סינון. או הציגו את כל המודעות."
          ctaLabel="הצגו את כל המודעות"
          ctaHref="/search"
          variant="full"
        />
      )}

      {/* Results — list view: breathable grid */}
      {view === "list" && items.length > 0 && (
        <section aria-label="תוצאות חיפוש" className="mt-2">
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10", loading && "opacity-70 pointer-events-none")}>
            {items.map((item) => (
              <ListingCard
                key={item.id}
                title={item.title}
                pricePerDay={item.pricePerDay}
                location={item.city}
                href={`/listing/${item.id}`}
                imageUrl={item.images?.[0]?.url}
                category={item.category}
                subcategory={item.subcategory ?? undefined}
                trustBadges={getListingTrustBadges({
                  kycStatus: item.owner?.kycStatus ?? null,
                  phoneNumber: item.owner?.phoneNumber ?? null,
                  completedBookingsCount: item.completedBookingsCount ?? 0,
                  reviewsCount: item.reviewsCount ?? 0,
                  averageRating: item.averageRating ?? 0,
                })}
              />
            ))}
          </div>
          {loading && items.length > 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" aria-live="polite">
              טוען עוד...
            </p>
          )}
          {hasMore && !loading && (
            <div className="pt-8">
              <Button
                variant="outline"
                className="w-full rounded-card border-border/80"
                onClick={() => void fetchResults(page + 1, false)}
              >
                טען עוד
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Map view */}
      {view === "map" && !showEmpty && (
        <section className={cn(loading && "opacity-70")}>
          <ListingsMap items={items} />
          {loading && (
            <div className="py-3 flex justify-center">
              <LoadingBlock message="טוען..." variant="inline" />
            </div>
          )}
        </section>
      )}
        </div>

        {/* ——— LEFT COLUMN: editorial support (varied treatment) ——— */}
        <aside className="lg:sticky lg:top-24 space-y-10" aria-label="מידע ועזרה">
          <TestimonialsCarousel />

          {/* Light: FAQ — minimal, link list only */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">שאלות נפוצות</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/help/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  איך מתבצעת ההשכרה?
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  מה עם פיקדון ותשלום?
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  כל השאלות והתשובות
                </Link>
              </li>
            </ul>
          </div>
        </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsCarousel() {
  const testimonials = useMemo(() => HOME_TESTIMONIALS, []);
  const [idx, setIdx] = useState(0);
  const t = testimonials[idx];

  const prev = () => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx((i) => (i + 1) % testimonials.length);

  return (
    <SurfaceCard padding="lg" className="border-t-4 border-t-[var(--mint-accent)]/40">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-foreground m-0">אנשים מספרים ❤️</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card hover:bg-muted/30 transition-colors"
            aria-label="ביקורת קודמת"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card hover:bg-muted/30 transition-colors"
            aria-label="ביקורת הבאה"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex gap-1 text-[var(--mint-accent)] mb-2" aria-hidden>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>

      <blockquote className="text-sm text-foreground leading-relaxed mb-3">
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] font-semibold flex items-center justify-center text-xs shrink-0"
            aria-hidden
          >
            {t.initial}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground m-0">{t.name}</p>
            <p className="text-xs text-muted-foreground m-0">{t.city}</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground tabular-nums m-0">
          {idx + 1}/{testimonials.length}
        </p>
      </div>
    </SurfaceCard>
  );
}
