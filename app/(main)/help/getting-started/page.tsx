import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Book, PlusCircle, Calendar, Shield, ArrowLeft } from "lucide-react";

function StepList({
  steps,
}: {
  steps: { step: number; title: string; desc: string }[];
}) {
  return (
    <div className="space-y-3">
      {steps.map(({ step, title, desc }) => (
        <div key={step} className="flex gap-3 sm:gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A8C6A] font-sans text-[13px] font-bold text-white">
            {step}
          </div>
          <div>
            <h3 className="mb-1 font-sans text-[14px] font-black text-black">{title}</h3>
            <p className="font-assistant text-[13px] text-[#888888]">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FAF6]">
            <Book className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            איך להתחיל?
          </h1>
          <p className="mt-2 font-assistant text-[15px] text-[#888888]">
            ככה משתמשים בפלטפורמה ומרוויחים כסף
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">איך ליצור מודעה</h2>
            </div>
            <StepList
              steps={[
                { step: 1, title: "התחברות לחשבון", desc: "יצירת חשבון או התחברות - צריך לאמת זהות כדי להתחיל לפרסם מודעות" },
                { step: 2, title: "כפתור \"פרסום מודעה\"", desc: "אפשר בדף המודעות או בדף הבית" },
                { step: 3, title: "מילוי פרטים", desc: "עדיף כמה שיותר פרטים כדי שהמשכיר יקבל את כל המידע שצריך לדעת לפני ההשכרה. פה זה גם המקום האישי שלך להיות יצירתי ואישי. תיאור, קטגוריה, תעריף יומי, תמונות \\ סרטונים וכו'." },
                { step: 4, title: "הגדרת זמינות", desc: "אפשר להשתמש בלוח השנה כדי להגביל תאריכים, גם תוך כדי שהמודעה באוויר אפשר לשנות כמובן" },
                { step: 5, title: "שליחה לאישור", desc: "הצוות שלנו יאשר את המודעה בדרך כלל תוך 24 שעות." },
              ]}
            />
            <div className="mt-4 border-t border-black/10 pt-4">
              <Link
                href="/add"
                className="inline-flex items-center gap-2 rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-[#157A5A]"
              >
                יצירת מודעה ראשונה
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">איך להזמין?</h2>
            </div>
            <StepList
              steps={[
                { step: 1, title: "חיפוש", desc: "חיפוש לפי קטגוריה, תאריכים, מיקום וכו'" },
                { step: 2, title: "בחירת תאריכים", desc: "לפי הזמינות של המשכיר, חשוב לוודא איסוף והחזרה" },
                { step: 3, title: "שליחת הזמנה ותשלום", desc: "למשכיר יש עד 12 שעות לאשר או לדחות את הבקשה" },
                { step: 4, title: "איסוף והחזרה", desc: "לאחר האישור המשכיר יתאם איתך קשר לגבי איסוף והחזרה. יש לעקוב אחרי ההוראות" },
              ]}
            />
            <div className="mt-4 border-t border-black/10 pt-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
              >
                מה יש לידך?
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">פקדונות</h2>
            </div>
            <p className="mb-4 font-assistant text-[13px] text-[#888888]">
              איך פיקדונות ביטחון עובדים בפלטפורמה
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">מהו פיקדון ביטחון?</h3>
                <p className="mb-3 font-assistant text-[13px] text-[#888888]">
                  פיקדון הביטחון הוא סכום להחזרה שמוחזק לכיסוי נזק או אובדן אפשריים. הוא מחושב לפי שווי הפריט ומשך ההשכרה.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">מתי גובים את הפיקדון?</h3>
                <p className="mb-3 font-assistant text-[13px] text-[#888888]">
                  הפיקדון מאושר (אבל לא נגבה) בעת ביצוע ההזמנה. הוא נגבה רק אם המשאיל מאשר את ההזמנה.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">מתי מחזירים את הפיקדון?</h3>
                <p className="mb-3 font-assistant text-[13px] text-[#888888]">
                  הפיקדון מוחזר במלואו כשמחזירים את הפריט באותו מצב. ההחזר בדרך כלל תוך 3–5 ימי עסקים.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">מה אם נגרם נזק?</h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  אם הפריט ניזוק או לא הוחזר, המשאיל יכול לפתוח מחלוקת. הצוות יבדוק ויכול לנכות מעלויות תיקון או החלפה מהפיקדון.
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-black/10 pt-4">
              <Link
                href="/help/faq"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
              >
                עוד שאלות נפוצות
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
