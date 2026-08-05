"use client";

import { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "פיקדונות ביטחון",
    questions: [
      {
        question: "מהו פיקדון הביטחון?",
        answer: "פיקדון הביטחון הוא סכום להחזרה שמוחזק כדי לכסות נזק או אובדן אפשריים של הפריט המושכר. הוא מחושב לפי שווי הפריט ומשך ההשכרה. הפיקדון מוחזר במלואו כשמחזירים את הפריט באותו מצב שבו התקבל.",
      },
      {
        question: "איך מחושב גובה הפיקדון?",
        answer: "גובה הפיקדון מחושב לפי שווי הפריט המשוער ומשך ההשכרה. פריטים יקרים יותר והשכרות ארוכות יותר דורשות בדרך כלל פיקדון גבוה יותר. תוכל לראות את הסכום המדויק לפני אישור ההזמנה.",
      },
      {
        question: "מתי אקבל את הפיקדון בחזרה?",
        answer: "הפיקדון מוחזר תוך 3–5 ימי עסקים לאחר החזרת הפריט, בתנאי שהוא באותו מצב כמו בקבלה. המשאיל יבדוק את הפריט ויאשר את ההחזרה לפני עיבוד ההחזר.",
      },
      {
        question: "מה קורה אם נגרם נזק לפריט?",
        answer: "אם הפריט ניזוק או לא הוחזר, המשאיל יכול לפתוח מחלוקת דרך הפלטפורמה. צוות התמיכה יבדוק תמונות וראיות משני הצדדים ויקבע אם יש לנכות מהפיקדון. תקבל הודעה על כל החלטה ותוכל לערער במידת הצורך.",
      },
    ],
  },
  {
    category: "ביטוח",
    questions: [
      {
        question: "איך עובד הביטוח?",
        answer: "הפלטפורמה מציעה כיסוי ביטוח אופציונלי להשכרות. בעת הזמנת פריט ניתן להוסיף ביטוח שמספק הגנה נוספת מפני נזק, גניבה או אובדן. עלות הביטוח מחושבת כאחוז משווי ההשכרה ואינה מוחזרת.",
      },
      {
        question: "מה הביטוח מכסה?",
        answer: "הביטוח מכסה בדרך כלל נזק מקרי, גניבה ואובדן של הפריט המושכר. הוא לא מכסה נזק מכוון, שימוש לרעה או נזק מפעילויות אסורות. יש לעיין בתנאי הביטוח לפרטי כיסוי.",
      },
      {
        question: "האם הביטוח חובה?",
        answer: "לא, הביטוח אופציונלי. עם זאת, מומלץ לרכוש ביטוח לפריטים יקרי ערך או אם יש חשש מנזק. פיקדון הביטחון נדרש בכל מקרה.",
      },
      {
        question: "איך מגישים תביעת ביטוח?",
        answer: "להגשת תביעת ביטוח יש לפנות לצוות התמיכה מיד לאחר האירוע. נדרשות תמונות, תיאור המאורע ומסמכים רלוונטיים. הצוות יבדוק את התביעה ויטפל בה לפי תנאי הביטוח.",
      },
    ],
  },
  {
    category: "הזמנות והשכרות",
    questions: [
      {
        question: "מה אם משהו נשבר במהלך ההשכרה?",
        answer: "אם משהו נשבר במהלך תקופת ההשכרה, פנה למשאיל מיד דרך מערכת ההודעות. צלם את הנזק ותעד את המאורע. בהתאם לנסיבות, ייתכן שתהיה אחראי לעלויות תיקון או החלפה שיכולות להינשך מהפיקדון. אם רכשת ביטוח, הוא עשוי לכסות חלק או את כל העלויות.",
      },
      {
        question: "האם אפשר לבטל הזמנה?",
        answer: "כן, ניתן לבטל הזמנה, אך מדיניות הביטול משתנה. ביטול לפני אישור המשאיל בדרך כלל ללא חיוב. ביטול לאחר האישור עשוי לחייב דמי ביטול בהתאם לקרבה לתאריך תחילת ההשכרה. יש לבדוק את מדיניות הביטול במודעה.",
      },
      {
        question: "מה אם המשאיל מבטל את ההזמנה?",
        answer: "אם המשאיל מבטל הזמנה שאושרה, תקבל החזר מלא כולל הפיקדון. נוכל גם לסייע במציאת חלופות. משאילים שמבטלים לעיתים קרובות עלולים להיפגע בהגבלות בפלטפורמה.",
      },
      {
        question: "איך מאריכים את תקופת ההשכרה?",
        answer: "להארכת ההשכרה יש לפנות למשאיל דרך מערכת ההודעות. אם הוא מסכים, ניתן לעדכן את ההזמנה דרך הפלטפורמה. יחולו חיובים נוספים עבור התקופה המורחבת.",
      },
    ],
  },
  {
    category: "תשלומים",
    questions: [
      {
        question: "איך משלמים?",
        answer: "לאחר יצירת ההזמנה תועברו לעמוד תשלום מאובטח. משלמים בכרטיס אשראי, וההזמנה מאושרת אוטומטית מיד לאחר תשלום מוצלח.",
      },
      {
        question: "מתי משלמים על ההשכרה?",
        answer: "התשלום מתבצע לאחר יצירת ההזמנה, בכרטיס אשראי בעמוד מאובטח. דמי ההשכרה והפיקדון נגבים יחד. הפיקדון מוחזר לאחר החזרת הפריט במצב תקין.",
      },
      {
        question: "מתי אקבל את הפיקדון בחזרה?",
        answer: "הפיקדון מוחזר בהתאם למצב הפריט בחזרה. לאחר החזרה המשאיל מאשר את המצב; אם אין נזק או חסר, הפיקדון משוחרר אליך. במחלוקת צוות התמיכה יבדוק ויחליט.",
      },
      {
        question: "אילו אמצעי תשלום מתקבלים?",
        answer: "התשלום מתבצע בכרטיס אשראי (Visa, Mastercard) בעמוד תשלום מאובטח.",
      },
      {
        question: "האם יש עמלות נוספות?",
        answer: "בנוסף לתעריף היומי מופיעים פיקדון ביטחון (להחזרה) ועמלת שירות. כל הסכומים מוצגים לפני אישור ההזמנה.",
      },
    ],
  },
  {
    category: "חשבון ואימות",
    questions: [
      {
        question: "האם צריך לאמת את החשבון?",
        answer: "אימות חשבון נדרש לפרסום מודעות ומומלץ לכל המשתמשים. האימות מסייע בבניית אמון בקהילה ויכול להידרש להשכרות יקרות ערך. ניתן לאמת את החשבון בהעלאת תעודת זהות.",
      },
      {
        question: "מהו ציון אמון?",
        answer: "ציון האמון הוא דירוג שמבוסס על הפעילות שלך בפלטפורמה: הזמנות שהושלמו, ביקורות ממשתמשים אחרים ומצב אימות החשבון. ציון גבוה יותר יכול לסייע באישור הזמנות ולאפשר פרסום מודעות נוספות.",
      },
      {
        question: "איך משפרים את ציון האמון?",
        answer: "ניתן לשפר את ציון האמון על ידי השלמת הזמנות בהצלחה, קבלת ביקורות חיוביות, אימות החשבון ושמירה על היסטוריה טובה. מומלץ להימנע מביטולים, מחלוקות וביקורות שליליות.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenIndex((prev) => (prev === key ? null : key));
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FAF6]">
            <HelpCircle className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            שאלות נפוצות
          </h1>
          <p className="mt-2 font-assistant text-[15px] text-[#888888]">
            תשובות לשאלות נפוצות על השימוש בפלטפורמה
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((cat, ci) => (
            <div key={ci}>
              <p className="mb-1 mt-2 font-sans text-[13px] font-black uppercase tracking-wide text-[#1A8C6A]">
                {cat.category}
              </p>
              <div className="rounded-[8px] border border-black/10 bg-white px-5">
                {cat.questions.map((faq, qi) => {
                  const key = `${ci}-${qi}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={qi}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="flex w-full cursor-pointer items-center justify-between border-b border-black/[0.08] py-4 last:border-b-0"
                      >
                        <span className="flex-1 text-right font-assistant text-[14px] font-semibold text-black">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className="mr-3 h-4 w-4 shrink-0 text-[#888888] transition-transform duration-200"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>
                      <div
                        className="overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isOpen ? "500px" : "0px" }}
                      >
                        <p className="pb-4 pt-1 font-assistant text-[13px] leading-relaxed text-[#888888]">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[8px] border border-[#1A8C6A]/15 bg-[#F0FAF6] p-6 text-center">
          <p className="font-sans text-[18px] font-black text-black">עדיין יש שאלות?</p>
          <p className="mt-1 mb-4 font-assistant text-[13px] text-[#888888]">
            לא מצאת מה שחיפשת? צוות התמיכה שלנו כאן לעזור.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/help"
              className="rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-black text-white transition-colors hover:bg-[#157A5A]"
            >
              יצירת קשר
            </Link>
            <Link
              href="/help"
              className="rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-black text-black transition-colors hover:bg-black/5"
            >
              חזרה למרכז העזרה
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
