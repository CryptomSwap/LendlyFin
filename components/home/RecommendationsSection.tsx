import ScrollRevealTitle from "@/components/home/ScrollRevealTitle";
import TestimonialSlideshowCard, {
  TESTIMONIAL_SLIDE_STAGGER_MS,
  type TestimonialSlide,
} from "@/components/home/TestimonialSlideshowCard";

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
    backText: "התחל להרוויח היום",
    buttonText: "העלה מודעה ←",
  },
] as const;

const BOTTOM_ROW_FLIPS = [
  {
    frontBg: "#2C2C2C",
    backBg: "#1A1A1A",
    stat: "100%",
    label: "מאובטח ובטוח",
    lightText: true,
    backText: "אנחנו שומרים עליך",
    buttonText: "קרא עוד ←",
  },
  {
    frontBg: "#1A8C6A",
    backBg: "#157A5A",
    stat: "+500",
    label: "פריטים להשכרה",
    lightText: true,
    backText: "מצא מה אתה צריך",
    buttonText: "לחיפוש ←",
  },
] as const;

const TOP_TESTIMONIALS: readonly TestimonialSlide[] = [
  {
    lines: [
      "השכרתי מצלמה לסוף השבוע וחסכתי אלפי שקלים.",
      "התהליך היה פשוט ומהיר.",
    ],
    name: "נועה לוי",
    avatar: "https://i.pravatar.cc/150?img=47",
    rating: 5.0,
  },
  {
    lines: [
      "שכרתי מקדחה לשיפוץ הבית במקום לקנות.",
      "חזרתי על ההשקעה כבר ביום הראשון.",
    ],
    name: "דוד שטרן",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 4.8,
  },
  {
    lines: [
      "מצאתי אוהל וציוד לטיול בדיוק ליד הבית.",
      "הכל היה מוכן לאיסוף תוך שעה.",
    ],
    name: "מיכל אברהם",
    avatar: "https://i.pravatar.cc/150?img=25",
    rating: 4.9,
  },
];

const BOTTOM_TESTIMONIALS: readonly TestimonialSlide[] = [
  {
    lines: [
      "העליתי את הציוד שלי ותוך יומיים",
      "כבר קיבלתי הזמנה ראשונה. מדהים.",
    ],
    name: "יוסי כהן",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 4.9,
  },
  {
    lines: [
      "השכרתי אופניים לסוף השבוע עם המשפחה.",
      "המחיר היה הוגן והתהליך קל מאוד.",
    ],
    name: "רונית גל",
    avatar: "https://i.pravatar.cc/150?img=44",
    rating: 5.0,
  },
  {
    lines: [
      "פרסמתי מקרן וקיבלתי פניות תוך שעות.",
      "לנדלי באמת עובדת בשבילך.",
    ],
    name: "עומר חדד",
    avatar: "https://i.pravatar.cc/150?img=15",
    rating: 4.7,
  },
];

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
    <section dir="rtl" className="mx-auto w-full max-w-[1420px] pb-12 pt-20">
      <header className="mb-12 px-5 text-center">
        <ScrollRevealTitle className="font-sans text-[48px] font-black leading-none tracking-[-2px] text-black">
          הם אהבו את לנדלי
        </ScrollRevealTitle>
        <ScrollRevealTitle
          as="p"
          delay={90}
          className="mt-2 font-assistant text-[48px] font-normal leading-none text-[#AAAAAA]"
        >
          אלפי משתמשים כבר משכירים ומשאילים
        </ScrollRevealTitle>
      </header>

      <div className="flex flex-col gap-3 px-5">
        {/* Row 1: flip · flip · testimonial */}
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

        {/* Row 2: testimonial · flip · flip */}
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
