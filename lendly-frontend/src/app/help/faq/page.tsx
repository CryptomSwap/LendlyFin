"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        question: "איך משלמים ב-Bit?",
        answer: "לאחר יצירת ההזמנה תועבר לתשלום ב-Bit. יש לציין את מספר ההזמנה (LND-XXXXXX) בעת התשלום. לאחר ביצוע התשלום ההזמנה תאושר ידנית על ידי הצוות — תקבל הודעה ברגע שההזמנה אושרה.",
      },
      {
        question: "מתי משלמים על ההשכרה?",
        answer: "התשלום מתבצע לאחר יצירת ההזמנה, דרך Bit. דמי ההשכרה והפיקדון נגבים יחד. הפיקדון מוחזר לאחר החזרת הפריט במצב תקין.",
      },
      {
        question: "מתי אקבל את הפיקדון בחזרה?",
        answer: "הפיקדון מוחזר בהתאם למצב הפריט בחזרה. לאחר החזרה המשאיל מאשר את המצב; אם אין נזק או חסר, הפיקדון משוחרר אליך. במחלוקת צוות התמיכה יבדוק ויחליט.",
      },
      {
        question: "אילו אמצעי תשלום מתקבלים?",
        answer: "התשלום מתבצע דרך Bit. יש לציין את מספר ההזמנה בעת התשלום או בפניית תמיכה.",
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
    setOpenIndex(prev => (prev === key ? null : key));
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-2xl mx-auto px-5 pt-12 space-y-6">

        {/* Back */}
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 font-assistant text-[13px] text-[#666666] hover:text-black transition-colors mb-4 group">
          <ChevronRight className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          חזרה
        </button>

        {/* Hero */}
        <div className="text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-[#F0FAF6] flex items-center justify-center">
            <HelpCircle className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[32px] font-black text-black text-center mt-4">
            שאלות נפוצות
          </h1>
          <p className="font-assistant text-[15px] text-[#666666] text-center">
            תשובות לשאלות נפוצות על השימוש בפלטפורמה
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {faqs.map((cat, ci) => (
            <div key={ci}>
              <p className="font-sans text-[13px] font-black text-[#1A8C6A] uppercase tracking-wide mt-2 mb-1">
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
                        className="flex items-center justify-between w-full py-4 border-b border-black/[0.08] cursor-pointer last:border-b-0"
                      >
                        <span className="font-assistant text-[14px] font-semibold text-black text-right flex-1">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className="h-4 w-4 text-[#666666] shrink-0 transition-transform duration-200 mr-3"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      <div
                        className="overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isOpen ? "500px" : "0px" }}
                      >
                        <p className="font-assistant text-[13px] text-[#666666] leading-relaxed pb-4 pt-1">
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

        {/* Bottom CTA */}
        <div className="rounded-[8px] bg-[#F0FAF6] border border-[#1A8C6A]/15 p-6 text-center mt-4">
          <p className="font-sans text-[18px] font-black text-black">
            עדיין יש שאלות?
          </p>
          <p className="font-assistant text-[13px] text-[#666666] mt-1 mb-4">
            לא מצאת מה שחיפשת? צוות התמיכה שלנו כאן לעזור.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="mailto:support@lendly.com"
              className="rounded-full bg-[#1A8C6A] text-white px-6 py-2.5 font-sans text-[14px] font-black hover:bg-[#157A5A] transition-colors duration-200"
            >
              יצירת קשר
            </Link>
            <Link
              href="/help"
              className="rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-black text-black hover:bg-black/5 transition-colors duration-200"
            >
              חזרה למרכז העזרה
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
