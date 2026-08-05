import { LifeBuoy, Book, HelpCircle, MessageSquare, Shield } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CARDS = [
  {
    icon: <Book className="h-5 w-5 text-[#1A8C6A]" />,
    title: "התחלה",
    desc: "למד איך להשתמש בפלטפורמה",
    links: [
      { label: "איך ליצור מודעה",  href: "/help/getting-started" },
      { label: "איך להזמין פריט",  href: "/help/getting-started" },
      { label: "הבנת פיקדונות",    href: "/help/getting-started" },
    ],
  },
  {
    icon: <HelpCircle className="h-5 w-5 text-[#1A8C6A]" />,
    title: "שאלות נפוצות",
    desc: "תשובות לשאלות שכיחות",
    links: [
      { label: "מהו פיקדון הביטחון?", href: "/help/faq" },
      { label: "איך עובד הביטוח?",    href: "/help/faq" },
      { label: "מה אם משהו נשבר?",   href: "/help/faq" },
    ],
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-[#1A8C6A]" />,
    title: "יצירת קשר",
    desc: "צריך עזרה? פנה אלינו",
    links: [
      { label: "דיווח על בעיה", href: "mailto:support@lendly.com" },
    ],
    extra: true,
  },
  {
    icon: <Shield className="h-5 w-5 text-[#1A8C6A]" />,
    title: "בטיחות ואמון",
    desc: "למד על אמצעי הבטיחות שלנו",
    links: [
      { label: "תהליך אימות",   href: "/help/safety" },
      { label: "ציון אמון",      href: "/help/safety" },
      { label: "יישוב מחלוקות", href: "/help/safety" },
    ],
  },
];

export default function HelpPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-2xl mx-auto px-5 pt-12 space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-[#F0FAF6] flex items-center justify-center">
            <LifeBuoy className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[32px] font-black text-black text-center mt-4">
            מרכז עזרה
          </h1>
          <p className="font-assistant text-[15px] text-[#666666] text-center">
            טיפים למשכיר ולשוכר בלנדלי
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map(card => (
            <div
              key={card.title}
              className="rounded-[8px] border border-black/10 bg-white p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200"
            >
              {card.icon}
              <p className="font-sans text-[16px] font-black text-black mt-3 mb-1">
                {card.title}
              </p>
              <p className="font-assistant text-[12px] text-[#666666] mb-3">
                {card.desc}
              </p>

              {card.links.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-assistant text-[13px] text-[#1A8C6A] hover:underline block py-0.5"
                >
                  {link.label}
                </Link>
              ))}

              {/* Contact card extras */}
              {card.extra && (
                <>
                  <p className="font-assistant text-[12px] text-[#666666] py-0.5">
                    support@lendly.com
                  </p>
                  <Link
                    href="mailto:support@lendly.com"
                    className="mt-3 rounded-full border border-black/15 px-4 py-2 font-assistant text-[13px] font-semibold text-black hover:bg-black/5 transition-colors w-full text-center block"
                  >
                    שלח הודעה
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="rounded-[8px] bg-[#F0FAF6] border border-[#1A8C6A]/15 p-6 text-center">
          <p className="font-sans text-[18px] font-black text-black mb-1">
            עדיין יש שאלות?
          </p>
          <p className="font-assistant text-[13px] text-[#666666] mb-4">
            הצוות שלנו כאן לעזור
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="mailto:support@lendly.com"
              className="rounded-full bg-[#1A8C6A] text-white px-6 py-2.5 font-sans text-[14px] font-black hover:bg-[#157A5A] transition-colors duration-200"
            >
              צור קשר
            </Link>
            <Link
              href="/help/faq"
              className="rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-black text-black hover:bg-black/5 transition-colors duration-200"
            >
              שאלות נפוצות
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
