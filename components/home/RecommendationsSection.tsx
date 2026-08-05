import ScrollRevealTitle from "@/components/home/ScrollRevealTitle";
import TestimonialSlideshowCard, {
  TESTIMONIAL_SLIDE_STAGGER_MS,
  type TestimonialSlide,
} from "@/components/home/TestimonialSlideshowCard";
import { HOME_TESTIMONIALS } from "@/lib/copy/help-reassurance";

const AVATAR_IDS = ["47", "33", "25", "44", "12"] as const;

function quoteToLines(quote: string): readonly [string, string] {
  const sentences = quote.match(/[^.!?…]+[.!?…]?/g)?.map((part) => part.trim()).filter(Boolean);
  if (sentences && sentences.length >= 2) {
    const midpoint = Math.ceil(sentences.length / 2);
    return [
      sentences.slice(0, midpoint).join(" "),
      sentences.slice(midpoint).join(" "),
    ];
  }

  const midpoint = Math.ceil(quote.length / 2);
  const breakAt = quote.lastIndexOf(" ", midpoint);
  if (breakAt > 24) {
    return [quote.slice(0, breakAt).trim(), quote.slice(breakAt).trim()];
  }

  return [quote, ""];
}

function toTestimonialSlides(): TestimonialSlide[] {
  return HOME_TESTIMONIALS.map((item, index) => ({
    lines: quoteToLines(item.quote),
    name: `${item.name} · ${item.city}`,
    avatar: `https://i.pravatar.cc/150?img=${AVATAR_IDS[index % AVATAR_IDS.length]}`,
    rating: 5,
  }));
}

const TESTIMONIAL_SLIDES = toTestimonialSlides();
const TOP_TESTIMONIALS = TESTIMONIAL_SLIDES.slice(0, 3);
const BOTTOM_TESTIMONIALS = TESTIMONIAL_SLIDES.slice(3);

const TOP_ROW_FLIPS = [
  {
    frontBg: "#C5CC7B",
    backBg: "#B0B86A",
    stat: "₪0",
    label: "עלות הצטרפות",
    lightText: false,
    backText: "הצטרף עכשיו בחינם",
    buttonText: "להרשמה ←",
  },
  {
    frontBg: "#5CB87A",
    backBg: "#4AA368",
    stat: "2 דק'",
    label: "להעלאת מודעה",
    lightText: true,
    backText: "העלו מודעה, הגדירו מחיר ותאריכים",
    buttonText: "העלו מודעה ←",
  },
] as const;

const BOTTOM_ROW_FLIPS = [
  {
    frontBg: "#2C2C2C",
    backBg: "#1A1A1A",
    stat: "100%",
    label: "מאומתים",
    lightText: true,
    backText: "מלווים עוברים אימות זהות",
    buttonText: "קרא עוד ←",
  },
  {
    frontBg: "#1A8C6A",
    backBg: "#157A5A",
    stat: "+500",
    label: "פריטים בקהילה",
    lightText: true,
    backText: "גלו ציוד להשכרה בקרבתכם",
    buttonText: "לחיפוש ←",
  },
] as const;

function FlipStatCard({
  frontBg,
  backBg,
  stat,
  label,
  lightText,
  backText,
  buttonText,
  className = "",
}: {
  frontBg: string;
  backBg: string;
  stat: string;
  label: string;
  lightText: boolean;
  backText: string;
  buttonText: string;
  className?: string;
}) {
  const statColor = lightText ? "#FFFFFF" : "#000000";
  const labelColor = lightText ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)";

  return (
    <div
      className={`recommendation-flip-card min-h-[160px] min-w-0 flex-1 cursor-pointer rounded-[8px] ${className}`}
    >
      <div className="recommendation-flip-card__inner relative min-h-[160px] w-full">
        <div
          className="recommendation-flip-card__face absolute inset-0 rounded-[8px] p-4"
          style={{ backgroundColor: frontBg }}
        >
          <p
            className="font-sans text-[38px] font-black leading-none"
            style={{ color: statColor }}
          >
            {stat}
          </p>
          <p
            className="mt-1 font-assistant text-[13px]"
            style={{ color: labelColor }}
          >
            {label}
          </p>
        </div>

        <div
          className="recommendation-flip-card__face recommendation-flip-card__face--back absolute inset-0 flex flex-col items-end justify-center rounded-[8px] p-4"
          style={{ backgroundColor: backBg }}
        >
          <p className="w-full text-right font-sans text-[16px] font-bold leading-[1.45] text-white">
            {backText}
          </p>
          <span
            className="mt-4 inline-block rounded-full bg-white px-5 py-2 font-sans text-[13px] font-bold"
            style={{ color: frontBg }}
          >
            {buttonText}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsSection() {
  return (
    <section dir="rtl" className="mx-auto w-full max-w-[1420px] pb-12 pt-20" aria-label="מה אומרים המשתמשים">
      <header className="mb-12 px-5 text-center">
        <ScrollRevealTitle className="font-sans text-[48px] font-black leading-none tracking-[-2px] text-black">
          אנשים מספרים ❤️
        </ScrollRevealTitle>
      </header>

      <div className="flex flex-col gap-3 px-5">
        <div className="flex items-stretch gap-3" dir="ltr">
          {TOP_ROW_FLIPS.map((card) => (
            <FlipStatCard
              key={card.stat}
              frontBg={card.frontBg}
              backBg={card.backBg}
              stat={card.stat}
              label={card.label}
              lightText={card.lightText}
              backText={card.backText}
              buttonText={card.buttonText}
            />
          ))}
          <TestimonialSlideshowCard testimonials={TOP_TESTIMONIALS} />
        </div>

        <div className="flex items-stretch gap-3" dir="ltr">
          <TestimonialSlideshowCard
            testimonials={BOTTOM_TESTIMONIALS}
            startDelayMs={TESTIMONIAL_SLIDE_STAGGER_MS}
          />
          {BOTTOM_ROW_FLIPS.map((card) => (
            <FlipStatCard
              key={card.stat}
              frontBg={card.frontBg}
              backBg={card.backBg}
              stat={card.stat}
              label={card.label}
              lightText={card.lightText}
              backText={card.backText}
              buttonText={card.buttonText}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
