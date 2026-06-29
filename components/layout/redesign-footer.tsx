import Link from "next/link";

const FOOTER_LINKS = {
  about: {
    title: "אודות",
    links: [
      { label: "אודות לנדלי", href: "/help" },
      { label: "איך זה עובד", href: "/#how-it-works" },
      { label: "אמון ובטיחות", href: "/help/safety" },
      { label: "שאלות נפוצות", href: "/help/faq" },
      { label: "תנאים והגבלות", href: "/help" },
    ],
  },
  discover: {
    title: "גלו",
    links: [
      { label: "עמוד החיפוש", href: "/search" },
      { label: "קטגוריות", href: "/search" },
      { label: "ערים", href: "/search" },
      { label: "העלו ציוד", href: "/add" },
      { label: "מדריך למשכירים", href: "/help" },
    ],
  },
  support: {
    title: "תמיכה",
    links: [
      { label: "מרכז העזרה", href: "/help" },
      { label: "צרו קשר", href: "/help" },
      { label: "תנאי ביטוח", href: "/help/insurance-terms" },
      { label: "פיקדונות ומחלוקות", href: "/help/faq" },
      { label: "תמיכה בהזמנות", href: "/help" },
    ],
  },
  owners: {
    title: "למשכירים",
    links: [
      { label: "כלי עבודה להשכרה", href: "/search" },
      { label: "מצלמות וציוד", href: "/search" },
      { label: "ציוד חוץ וקמפינג", href: "/search" },
      { label: "ציוד מוזיקה ואירועים", href: "/search" },
      { label: "השכרות מקומיות בישראל", href: "/search" },
    ],
  },
} as const;

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "LinkedIn", href: "#", icon: LinkedInIcon },
] as const;

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 11v6M8 8v.01M12 17v-4a2 2 0 0 1 4 0v4" />
    </svg>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block py-1.5 text-right font-assistant text-[16px] font-medium text-black transition-colors duration-200 hover:text-[#1A8C6A]"
    >
      {children}
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-3 font-assistant text-[13px] font-medium text-[#999999]">
        {title}
      </h3>
      <ul>
        {links.map(({ label, href }) => (
          <li key={`${title}-${label}`}>
            <FooterLink href={href}>{label}</FooterLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-white pb-8 pt-4" role="contentinfo" aria-label="תחתית האתר">
      <div className="mx-auto w-full max-w-[1420px] px-5">
        <div
          dir="rtl"
          className="overflow-hidden rounded-[8px] bg-white"
          style={{ border: "1px solid rgba(0,0,0,0.15)" }}
        >
          <div className="px-8 py-10">
            <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] items-start gap-x-14">
              <div className="flex min-w-0 flex-col gap-5">
                <div>
                  <Link
                    href="/"
                    className="shrink-0"
                    style={{
                      fontFamily: "var(--font-heebo)",
                      fontWeight: 900,
                      fontSize: "36px",
                      color: "#1A8C6A",
                      lineHeight: 1,
                    }}
                  >
                    לנדלי
                  </Link>
                  <p
                    className="mt-4 max-w-[15rem] leading-[1.55]"
                    style={{
                      fontFamily: "var(--font-assistant)",
                      fontSize: "15px",
                      color: "#888888",
                    }}
                  >
                    השכרת ציוד בין אנשים — גלו ציוד בקרבתכם.
                  </p>
                </div>

                <div
                  className="flex flex-col justify-between rounded-lg p-4"
                  style={{ backgroundColor: "#1A8C6A" }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heebo)",
                      fontWeight: 900,
                      fontSize: "18px",
                      color: "#fff",
                      lineHeight: 1.4,
                    }}
                  >
                    מה שוכב לך בבית?
                    <br />
                    תתחיל להרוויח
                  </p>
                  <Link
                    href="/add"
                    className="mt-4 inline-flex items-center justify-center self-start rounded bg-white px-4 py-2 transition-opacity duration-200 hover:opacity-90"
                    style={{
                      fontFamily: "var(--font-heebo)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#1A8C6A",
                    }}
                  >
                    פרסם עכשיו ←
                  </Link>
                </div>
              </div>

              <FooterColumn
                title={FOOTER_LINKS.about.title}
                links={FOOTER_LINKS.about.links}
              />
              <FooterColumn
                title={FOOTER_LINKS.discover.title}
                links={FOOTER_LINKS.discover.links}
              />
              <FooterColumn
                title={FOOTER_LINKS.support.title}
                links={FOOTER_LINKS.support.links}
              />
              <FooterColumn
                title={FOOTER_LINKS.owners.title}
                links={FOOTER_LINKS.owners.links}
              />
            </div>
          </div>

          <div
            style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }}
            aria-hidden
          />

          <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
            <div className="text-right">
              <p
                style={{
                  fontFamily: "var(--font-heebo)",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#000000",
                }}
              >
                לנדלי בע״מ
              </p>
              <a
                href="mailto:hello@lendly.co.il"
                className="mt-0.5 inline-block transition-colors duration-200 hover:text-[#1A8C6A]"
                style={{
                  fontFamily: "var(--font-assistant)",
                  fontSize: "13px",
                  color: "#888888",
                }}
              >
                hello@lendly.co.il
              </a>
              <p
                className="mt-2 leading-relaxed"
                style={{
                  fontFamily: "var(--font-assistant)",
                  fontSize: "12px",
                  color: "#AAAAAA",
                }}
              >
                פלטפורמת השכרת ציוד בין עמיתים. ישראל.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-gray-400 transition-colors duration-200 hover:text-[#1A8C6A]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
