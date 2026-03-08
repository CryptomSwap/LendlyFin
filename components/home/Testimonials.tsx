import Image from "next/image";
import { Star } from "lucide-react";
import { HOME_TESTIMONIALS } from "@/lib/copy/help-reassurance";

const TESTIMONIAL_IMAGE_SRC =
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80";

function TestimonialCard({
  quote,
  name,
  city,
  initial,
}: {
  quote: string;
  name: string;
  city: string;
  initial: string;
}) {
  return (
    <div
      className="rounded-xl border border-border/60 bg-card/95 p-4 shadow-sm"
      role="article"
    >
      <div className="flex gap-1 text-[var(--mint-accent)] mb-2" aria-hidden>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <blockquote className="text-sm text-foreground leading-relaxed mb-3">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-full bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] font-semibold flex items-center justify-center text-xs shrink-0"
          aria-hidden
        >
          {initial}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{city}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Homepage testimonials: clean editorial layout.
 * Top row: main testimonial (text-first, soft surface) + supporting landscape image.
 * Bottom row: three compact cards, same size, one row (desktop) or scroll/stack (mobile).
 */
export function Testimonials() {
  const [primary, ...secondary] = HOME_TESTIMONIALS;
  const supporting = secondary.slice(0, 3);

  return (
    <section
      className="space-y-10 md:space-y-12"
      dir="rtl"
      aria-label="מה אומרים המשתמשים"
    >
      {/* Top row: main testimonial (left in LTR / right in RTL) + image (right in LTR / left in RTL) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10 lg:items-center">
        {/* Main testimonial — text-first, focal point, softer surface */}
        <div className="order-2 lg:order-1">
          <h2 className="section-title text-lg md:text-xl mb-5">
            מה אומרים המשתמשים
          </h2>
          <blockquote className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed mb-5">
            &ldquo;{primary.quote}&rdquo;
          </blockquote>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex gap-1 text-[var(--mint-accent)]" aria-hidden>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 rounded-full bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] font-semibold flex items-center justify-center text-sm shrink-0"
                aria-hidden
              >
                {primary.initial}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{primary.name}</p>
                <p className="text-xs text-muted-foreground">{primary.city}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Supporting image — landscape, secondary, does not dominate */}
        <div className="order-1 lg:order-2 relative w-full aspect-[16/10] lg:aspect-[16/10] rounded-2xl overflow-hidden">
          <Image
            src={TESTIMONIAL_IMAGE_SRC}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
            priority={false}
          />
        </div>
      </div>

      {/* Bottom row: three compact cards, same size, one clean row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {supporting.map((t, i) => (
          <TestimonialCard
            key={i}
            quote={t.quote}
            name={t.name}
            city={t.city}
            initial={t.initial}
          />
        ))}
      </div>
    </section>
  );
}
