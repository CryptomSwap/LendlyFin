import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { OWNER_CTA } from "@/lib/copy/help-reassurance";

interface OwnerCTAProps {
  /** If true, user is signed in and can go to /add; else CTA goes to /signin */
  isSignedIn: boolean;
}

/**
 * Owner/lender CTA section: benefit copy + CTA to add listing or sign in.
 * Visually distinct from renter sections (e.g. border or background tint).
 */
export function OwnerCTA({ isSignedIn }: OwnerCTAProps) {
  return (
    <section
      className="pt-6 md:pt-6 rounded-2xl border border-border bg-muted/30 px-6 py-8 md:px-8 md:py-8"
      aria-label="משכירים ציוד"
    >
      <div className="max-w-xl md:max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-lg font-semibold text-foreground md:text-xl">
          {OWNER_CTA.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {OWNER_CTA.subtitle}
        </p>
        <div className="pt-2">
          <Button asChild size="lg" variant="mint" className="gap-2 text-base shadow-cta ring-2 ring-[var(--mint-accent)]/30 px-8">
            <Link href={isSignedIn ? OWNER_CTA.addHref : OWNER_CTA.signInHref}>
              <Upload className="h-5 w-5" aria-hidden />
              {isSignedIn ? OWNER_CTA.ctaLabel : OWNER_CTA.ctaLabelSignedOut}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
