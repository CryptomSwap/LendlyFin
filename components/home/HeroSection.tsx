import Link from "next/link";
import SearchInput from "@/components/search-input";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Search, Upload, DollarSign } from "lucide-react";
import { HOME_TRUST_ONELINER } from "@/lib/copy/help-reassurance";
import { HeroExperienceBackground } from "@/components/home/HeroExperienceBackground";
import { DesktopCategoryDiscovery } from "@/components/home/DesktopCategoryDiscovery";
import { HomeHeroNav } from "@/components/home/HomeHeroNav";

interface HeroSectionProps {
  /** If null, user is signed out — show subtle auth hint and owner CTA to signin */
  user: { id: string } | null;
}

/**
 * Desktop: left-edge 20% categories sidebar + right 80% hero (image + content). Mobile: simplified hero — headline, search card (primary), upload secondary.
 */
export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section
      className="relative h-[60vh] min-h-[60vh] pb-3 pt-0 mt-0 overflow-hidden rounded-none w-screen max-w-[100vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] md:h-auto md:w-screen md:max-w-[100vw] md:ml-[calc(-50vw+50%)] md:mr-[calc(-50vw+50%)] md:rounded-b-2xl md:min-h-[min(72vh,700px)] md:pb-0 md:pt-0 md:flex md:flex-row bg-transparent md:[background:linear-gradient(to_right,var(--home-gradient-start),var(--home-gradient-end))]"
      aria-label="בית"
    >
      {/* Desktop: hero area = 80% width (right side in RTL). Rounded bottom so image bottom-right is rounded. */}
      <div className="flex-1 min-w-0 w-full md:w-4/5 relative flex flex-col min-h-0 h-full md:h-auto md:rounded-b-2xl md:overflow-hidden">
        <HomeHeroNav />
        <HeroExperienceBackground />
        {/* Gradient overlay: stronger at top for text readability on bright images, fades to transparent */}
        <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-black/45 via-black/25 to-transparent" aria-hidden />
        {/* Desktop: create listing button at bottom right of image — matches homepage mint buttons */}
        <div className="hidden md:flex absolute bottom-4 right-4 z-10">
          {user ? (
            <Button asChild size="lg" variant="mint" className="gap-2 shadow-soft">
              <Link href="/add" aria-label="השכר ציוד">
                <DollarSign className="h-5 w-5 shrink-0" aria-hidden />
                השכר ציוד
              </Link>
            </Button>
          ) : (
            <Link href="/signin" className="text-sm font-medium text-white/95 hover:text-white hover:underline">
              משכירים? התחברו עם Google
            </Link>
          )}
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 md:pl-8 md:pr-14 pt-20 md:pt-20 md:pb-14 lg:pt-24 lg:pb-16">
          <div className="w-full max-w-2xl md:mx-auto md:text-center">
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="min-w-0 space-y-3 md:space-y-4">
                {/* Mobile: logo just above headline */}
                <div className="flex justify-center md:hidden [&_img]:brightness-0 [&_img]:invert">
                  <Logo size={56} linkToHome />
                </div>
                <h1 className="flex items-center justify-center text-xl font-bold tracking-tight text-white sm:text-2xl md:text-2xl lg:text-[1.85rem]">
                  <span>שכרו ציוד מאנשים לידכם — או השכירו את שלכם</span>
                </h1>

                {/* Desktop: search — primary action area, clear hierarchy */}
                <div className="hidden md:flex md:flex-col md:items-center md:space-y-4">
                  <div className="w-full max-w-xl">
                    <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
                      <div className="flex-1 min-w-0">
                        <SearchInput
                          placeholder="מה מחפשים? ציוד, כלים, מצלמות..."
                          size="lg"
                          embedded
                          translucent
                        />
                      </div>
                      <Link href="/search" className="inline-flex shrink-0 sm:self-stretch" aria-label="חפשו השכרות">
                        <Button size="lg" variant="mint" className="w-full sm:w-auto sm:min-h-[2.75rem] sm:min-w-[2.75rem] rounded-xl font-semibold">
                          <Search className="h-4 w-4" aria-hidden />
                          חפשו
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 font-medium text-center max-w-md">
                    {HOME_TRUST_ONELINER}
                  </p>
                </div>
              </div>

              {/* Mobile: search — primary action, no box */}
              <div className="md:hidden w-full space-y-3">
                <SearchInput
                  placeholder="מה מחפשים? ציוד, כלים, מצלמות..."
                  size="lg"
                  translucent
                />
                <div className="pt-1">
                  {user ? (
                    <Link href="/add" className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white transition-colors">
                      <Upload className="h-3.5 w-3.5" aria-hidden />
                      העלו מודעה
                    </Link>
                  ) : (
                    <p className="text-xs text-white/80">
                      משכירים?{" "}
                      <Link href="/signin" className="font-medium text-white hover:underline">
                        התחברו עם Google
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: left-edge categories sidebar = 20% width; unified surface with hero */}
      <aside
        className="hidden md:flex md:w-1/5 md:flex-shrink-0 md:min-h-[min(72vh,700px)] border-l border-primary/10 bg-background"
        aria-label="גלו לפי קטגוריה"
      >
        <DesktopCategoryDiscovery />
      </aside>
    </section>
  );
}
