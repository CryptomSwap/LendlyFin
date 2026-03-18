import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyLendly } from "@/components/home/WhyLendly";
import { HeroSection } from "@/components/home/HeroSection";
import { DesktopCategoryDiscovery } from "@/components/home/DesktopCategoryDiscovery";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { FAQBlock } from "@/components/ui/faq-block";
import {
  HOME_HELP_LINKS,
  HOME_TRUST_ONELINER,
  HOME_FAQ_ITEMS,
} from "@/lib/copy/help-reassurance";
import { getCurrentUser } from "@/lib/admin";
import { getFeaturedListings } from "@/lib/listings";
import { Search, Upload } from "lucide-react";
import DesktopFooter from "@/components/layout/desktop-footer";

const PATH_ADD = "/add";
const PATH_SIGNIN = "/signin";

export default async function HomePage() {
  const user = await getCurrentUser();
  const featuredListings = await getFeaturedListings(12);
  const ctaHref = user ? PATH_ADD : PATH_SIGNIN;
  const ctaLabel = "פרסום ציוד";
  const ctaVariant = user ? "mint" : "outline";
  const ctaClassName = user ? "gap-2 shadow-cta" : "gap-2 bg-card opacity-90";

  return (
    <div
      className="min-h-screen pb-6 md:pb-10 w-full home-page-bg"
      dir="rtl"
    >
      {/* A. Hero — full-width on desktop, no inner max-width */}
      <HeroSection user={user} />

      {/* B. Category discovery — mobile only below hero; strong container (max-w-5xl) and card */}
      <section
        className="-mt-6 md:mt-0 md:pt-0 md:hidden w-full max-w-5xl mx-auto px-4 sm:px-6 rounded-2xl overflow-hidden bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
        aria-label="גלה לפי קטגוריה"
      >
        <DesktopCategoryDiscovery />
      </section>

      {/* Page-level content band. Mobile: narrow; desktop: full width up to 7xl. */}
      <div className="w-full max-w-md md:max-w-7xl md:mx-auto pt-0">
        {/* C. Trust one-liner — mobile only; desktop has it in hero */}
        <section className="pt-6 md:hidden" aria-label="אמון">
          <p className="text-center text-sm text-muted-foreground font-medium max-w-2xl mx-auto">
            {HOME_TRUST_ONELINER}
          </p>
        </section>
      </div>

      {/* D. Featured listings — full-width so cards can be big */}
      <div className="w-full px-4 md:px-8">
        <div className="w-full max-w-[160rem] mx-auto">
          <FeaturedListings listings={featuredListings} />
        </div>
      </div>

      {/* Under-the-fold: single band */}
      <div className="w-full max-w-md md:max-w-7xl md:mx-auto pt-0">
        {/* E. How it works — light step row */}
        <section className="pt-8 md:pt-10" aria-label="איך זה עובד">
          <HowItWorks />
        </section>
      </div>

      {/* G. Testimonials — on page background (no band) */}
      <section
        className="py-20 md:py-24 w-full"
        aria-label="מה אומרים המשתמשים"
      >
        <div className="w-full max-w-md mx-auto md:max-w-[85rem] md:px-8 px-4">
          <Testimonials />
        </div>
      </section>

      {/* Under-the-fold continues — wide desktop container (90rem) so section feels confident */}
      <div className="w-full max-w-md md:max-w-7xl lg:max-w-[90rem] md:mx-auto pt-0">
        {/* H+J. Why Lendly + FAQ — on page background (no band) */}
        <section
          className="py-10 md:py-12 px-4 md:px-8"
          aria-label="למה להשתמש בלנדלי ושאלות נפוצות"
        >
          <div className="max-w-md md:max-w-7xl lg:max-w-[90rem] mx-auto">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[17fr_8fr] lg:gap-x-14 lg:gap-y-0 lg:items-start">
              <div role="region" aria-label="למה להשתמש בלנדלי" className="min-w-0">
                <WhyLendly />
              </div>
              <div
                className="pt-6 md:pt-8 lg:pt-0 min-w-0"
                role="region"
                aria-label="שאלות נפוצות"
              >
                <FAQBlock
                  title="שאלות נפוצות"
                  items={HOME_FAQ_ITEMS}
                  moreLink={{ href: "/help/faq", label: "כל השאלות והתשובות" }}
                  className="lg:py-3"
                />
              </div>
            </div>
          </div>
        </section>

        {/* K. Final CTA — soft integrated block (no full-width band) */}
        <section
          className="mt-6 md:mt-8"
          aria-label="פעולה ועזרה"
        >
          <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--mint-accent)]/15 bg-[var(--mint-accent)]/5 py-16 md:py-20 px-6 md:px-8 text-center space-y-5 shadow-[0_2px_16px_rgba(47,191,159,0.08)]">
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">
              אז מה שוכב לך בבית?
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:flex-wrap pt-2">
              <Button asChild size="lg" variant="mint" className="gap-2 shadow-cta">
                <Link href="/search">
                  <Search className="h-4 w-4" aria-hidden />
                  חיפוש
                </Link>
              </Button>
              <Button asChild size="lg" variant={ctaVariant} className={ctaClassName}>
                <Link href={ctaHref}>
                  <Upload className="h-4 w-4" aria-hidden />
                  {ctaLabel}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Desktop footer: full-width bottom section, hidden on mobile */}
      <DesktopFooter />
    </div>
  );
}
