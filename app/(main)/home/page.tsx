import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyLendly } from "@/components/home/WhyLendly";
import { HeroSection } from "@/components/home/HeroSection";
import { DesktopCategoryDiscovery } from "@/components/home/DesktopCategoryDiscovery";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { OwnerCTA } from "@/components/home/OwnerCTA";
import { FAQBlock } from "@/components/ui/faq-block";
import {
  HOME_HELP_LINKS,
  HOME_TRUST_ONELINER,
  HOME_FAQ_ITEMS,
} from "@/lib/copy/help-reassurance";
import { getCurrentUser } from "@/lib/admin";
import { getFeaturedListings } from "@/lib/listings";
import { Search } from "lucide-react";

const PATH_ADD = "/add";
const PATH_SIGNIN = "/signin";

export default async function HomePage() {
  const user = await getCurrentUser();
  const featuredListings = await getFeaturedListings(12);
  const ctaHref = user ? PATH_ADD : PATH_SIGNIN;
  const ctaLabel = user ? "העלו מודעה" : "התחברו להעלאה";
  const ctaVariant = user ? "mint" : "outline";
  const ctaClassName = user ? "gap-2 shadow-cta" : "gap-2 bg-card opacity-90";

  return (
    <div
      className="min-h-screen pb-6 md:pb-10 w-full"
      dir="rtl"
    >
      {/* A. Hero — full-width on desktop, no inner max-width */}
      <HeroSection user={user} />

      {/* Page-level content band. Mobile: narrow; desktop: full width up to 7xl. */}
      <div className="w-full max-w-md md:max-w-7xl md:mx-auto pt-0">
        {/* B. Category discovery — mobile only below hero */}
        <section
          className="-mt-6 md:mt-0 md:pt-0 md:hidden w-full rounded-2xl overflow-hidden home-gradient-bg-subtle shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          aria-label="גלה לפי קטגוריה"
        >
          <DesktopCategoryDiscovery />
        </section>

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

      {/* G. Testimonials — full-width section, wider inner container, editorial asymmetric layout */}
      <section
        className="py-20 md:py-24 w-full home-gradient-bg-subtle"
        aria-label="מה אומרים המשתמשים"
      >
        <div className="w-full max-w-md mx-auto md:max-w-[85rem] md:px-8 px-4">
          <Testimonials />
        </div>
      </section>

      {/* Under-the-fold continues */}
      <div className="w-full max-w-md md:max-w-7xl md:mx-auto pt-0">
        {/* H. Why Lendly — editorial feature grid */}
        <section
          className="py-20 md:py-24 -mx-4 px-4 md:-mx-8 md:px-8 bg-muted/25"
          aria-label="למה להשתמש בלנדלי"
        >
          <div className="max-w-md md:max-w-7xl mx-auto">
            <WhyLendly />
          </div>
        </section>

        {/* I. Owner CTA */}
        <OwnerCTA isSignedIn={!!user} />

        {/* J. FAQ — narrower for readable accordion */}
        <section className="pt-6 md:pt-8" aria-label="שאלות נפוצות">
          <div className="max-w-3xl mx-auto">
            <FAQBlock
              title="שאלות נפוצות"
              items={HOME_FAQ_ITEMS}
              moreLink={{ href: "/help/faq", label: "כל השאלות והתשובות" }}
            />
          </div>
        </section>

        {/* K. Final CTA — gradient band, clear final action */}
        <section
          className="mt-10 md:mt-12 py-16 md:py-20 -mx-4 px-4 md:-mx-8 md:px-8 home-gradient-bg rounded-2xl md:rounded-2xl"
          aria-label="פעולה ועזרה"
        >
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">
              מוכנים להתחיל?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              חפשו ציוד להשכרה או העלו מודעה — פשוט ובטוח.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:flex-wrap pt-2">
              <Button asChild size="lg" variant="mint" className="gap-2 shadow-cta">
                <Link href="/search">
                  <Search className="h-4 w-4" aria-hidden />
                  חפשו השכרות
                </Link>
              </Button>
              <Button asChild size="lg" variant={ctaVariant} className={ctaClassName}>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-2 pt-8 max-w-2xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            השכרה בין אנשים · גלו ציוד בקרבתכם
          </p>
          <p className="text-xs text-muted-foreground">
            {HOME_HELP_LINKS.line}{" "}
            <Link
              href={HOME_HELP_LINKS.helpHref}
              className="text-primary font-medium hover:underline"
            >
              {HOME_HELP_LINKS.helpLabel}
            </Link>
            {" · "}
            <Link
              href={HOME_HELP_LINKS.faqHref}
              className="text-primary font-medium hover:underline"
            >
              {HOME_HELP_LINKS.faqLabel}
            </Link>
          </p>
        </div>
        </section>
      </div>
    </div>
  );
}
