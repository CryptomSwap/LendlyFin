import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { LifeBuoy, MessageSquare, Book, HelpCircle, Shield, Mail } from "lucide-react";

const sections = [
  {
    icon: Book,
    title: "התחלה",
    description: "למד איך להשתמש בפלטפורמה",
    links: [
      { href: "/help/getting-started", label: "איך ליצור מודעה" },
      { href: "/help/getting-started", label: "איך להזמין פריט" },
      { href: "/help/getting-started", label: "הבנת פיקדונות" },
    ],
  },
  {
    icon: HelpCircle,
    title: "שאלות נפוצות",
    description: "תשובות לשאלות שכיחות",
    links: [
      { href: "/help/faq", label: "מהו פיקדון הביטחון?" },
      { href: "/help/faq", label: "איך עובד הביטוח?" },
      { href: "/help/faq", label: "מה אם משהו נשבר?" },
    ],
  },
  {
    icon: MessageSquare,
    title: "יצירת קשר",
    description: "צריך עזרה? פנה אלינו",
    links: null as null | { href: string; label: string }[],
  },
  {
    icon: Shield,
    title: "בטיחות ואמון",
    description: "למד על אמצעי הבטיחות שלנו",
    links: [
      { href: "/help/safety", label: "תהליך אימות" },
      { href: "/help/safety", label: "ציון אמון" },
      { href: "/help/safety", label: "יישוב מחלוקות" },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FAF6]">
            <LifeBuoy className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            מרכז עזרה
          </h1>
          <p className="mt-2 font-assistant text-[15px] text-[#888888]">
            טיפים למשכיר ולשוכר בלנדלי
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-[8px] border border-black/10 bg-white p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[#1A8C6A]" />
                  <h2 className="font-sans text-[16px] font-black text-black">
                    {section.title}
                  </h2>
                </div>
                <p className="mb-4 font-assistant text-[13px] text-[#888888]">
                  {section.description}
                </p>

                {section.title === "יצירת קשר" ? (
                  <div className="space-y-3">
                    <a
                      href={`mailto:support@lendly.com?subject=${encodeURIComponent(
                        "[Bug Report] Help center"
                      )}`}
                      className="inline-flex w-full items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2.5 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
                    >
                      דיווח על בעיה
                    </a>
                    <div className="flex items-center gap-2 font-assistant text-[13px] text-[#888888]">
                      <Mail className="h-4 w-4" />
                      <a
                        href="mailto:support@lendly.com"
                        className="text-[#1A8C6A] hover:underline"
                      >
                        support@lendly.com
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {section.links?.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="block font-assistant text-[14px] font-semibold text-[#1A8C6A] hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
