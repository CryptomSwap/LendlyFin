"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

const FOOTER_LINKS = {
  about: [
    { label: "אודות לנדלי", href: "/help" },
    { label: "איך זה עובד", href: "/home#how-it-works" },
    { label: "אמון ובטיחות", href: "/help/safety" },
    { label: "שאלות נפוצות", href: "/help/faq" },
    { label: "תנאים והגבלות", href: "/help" },
  ],
  discover: [
    { label: "עמוד החיפוש", href: "/search" },
    { label: "קטגוריות", href: "/search" },
    { label: "ערים", href: "/search" },
    { label: "העלו ציוד", href: "/add" },
    { label: "מדריך למשכירים", href: "/help" },
  ],
  support: [
    { label: "מרכז העזרה", href: "/help" },
    { label: "צרו קשר", href: "/help" },
    { label: "תנאי ביטוח", href: "/help/insurance-terms" },
    { label: "פיקדונות ומחלוקות", href: "/help/faq" },
    { label: "תמיכה בהזמנות", href: "/help" },
  ],
  platform: [
    { label: "כלי עבודה להשכרה לידכם", href: "/search" },
    { label: "מצלמות וציוד", href: "/search" },
    { label: "ציוד חוץ וקמפינג", href: "/search" },
    { label: "ציוד מוזיקה ואירועים", href: "/search" },
    { label: "השכרות מקומיות בישראל", href: "/search" },
  ],
} as const;

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "LinkedIn", href: "#", icon: Linkedin },
] as const;

function Column({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3
        className="text-[13px] font-semibold tracking-wide uppercase tracking-[0.02em] text-[var(--footer-heading)] mb-5"
        style={{ letterSpacing: "0.04em" }}
      >
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map(({ label, href }) => (
          <li key={href + label}>
            <Link
              href={href}
              className="text-[13px] text-[var(--footer-body)] hover:text-[var(--mint-accent)] transition-colors duration-200 leading-relaxed"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function DesktopFooter() {
  return (
    <footer
      className="hidden lg:block w-full footer-desktop-bg"
      role="contentinfo"
      aria-label="תחתית האתר"
    >
      <div className="w-full max-w-[90rem] mx-auto px-10 py-14" dir="rtl">
        {/* Main 5-column grid */}
        <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] gap-x-14 gap-y-0 items-start">
          {/* Brand — more prominent */}
          <div className="flex flex-col gap-5 min-w-0 text-[var(--footer-heading)]">
            <Logo
              size={52}
              linkToHome
              className="[&_img]:brightness-0 [&_img]:invert [&_img]:opacity-95"
            />
            <p className="text-[15px] leading-[1.55] text-[var(--footer-body)] max-w-[15rem]">
              השכרת ציוד בין אנשים — גלו ציוד בקרבתכם.
            </p>
          </div>

          <Column title="אודות" links={FOOTER_LINKS.about} />
          <Column title="גלו" links={FOOTER_LINKS.discover} />
          <Column title="תמיכה" links={FOOTER_LINKS.support} />
          <Column title="למשכירים ולקטגוריות" links={FOOTER_LINKS.platform} />
        </div>

        {/* Thin divider */}
        <div
          className="mt-12 pt-6 border-t border-[var(--footer-divider)]"
          aria-hidden
        />

        {/* Bottom row: company/legal + social — tighter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5 text-right">
            <p className="text-[13px] font-medium text-[var(--footer-heading)]">
              לנדלי בע&quot;מ
            </p>
            <a
              href="mailto:hello@lendly.co.il"
              className="text-[13px] text-[var(--footer-body)] hover:text-[var(--mint-accent)] transition-colors duration-200 inline-flex items-center gap-1.5 mt-0.5"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
              hello@lendly.co.il
            </a>
            <p className="text-[12px] text-[var(--footer-muted)] mt-2 leading-relaxed">
              פלטפורמת השכרת ציוד בין עמיתים. ישראל.
            </p>
          </div>
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-[var(--footer-muted)] hover:text-[var(--footer-body)] transition-colors duration-200 p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--footer-body)]/40 focus:ring-offset-2 focus:ring-offset-[var(--footer-bg)]"
              >
                <Icon className="h-4 w-4" aria-hidden strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
