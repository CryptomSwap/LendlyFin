import { Shield } from "lucide-react";
import { PageContainer } from "@/components/layout";

export default function InsuranceTermsPage() {
  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FAF6]">
            <Shield className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            תנאי ביטוח
          </h1>
          <p className="mt-2 font-assistant text-[15px] text-[#888888]">
            עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}
          </p>
        </div>

        <div className="space-y-6 rounded-[8px] border border-black/10 bg-white p-5 sm:p-8">
          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">1. סקירת כיסוי</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              הפלטפורמה מציעה כיסוי ביטוח אופציונלי לפריטים מושכרים. הכיסוי מספק הגנה מפני נזק, אובדן או גניבה במהלך תקופת ההשכרה.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">2. מה מכוסה</h2>
            <p className="mb-2 font-assistant text-[14px] text-[#888888]">כיסוי הביטוח כולל:</p>
            <ul className="ms-4 list-inside list-disc space-y-1 font-assistant text-[14px] text-[#888888]">
              <li>נזק מקרי לפריט המושכר</li>
              <li>גניבת הפריט (עם תעודת משטרה)</li>
              <li>אובדן הפריט המושכר</li>
              <li>עלויות תיקון עד לשווי הפריט המוצהר</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">3. מה לא מכוסה</h2>
            <p className="mb-2 font-assistant text-[14px] text-[#888888]">הביטוח לא מכסה:</p>
            <ul className="ms-4 list-inside list-disc space-y-1 font-assistant text-[14px] text-[#888888]">
              <li>בלאי רגיל</li>
              <li>נזק מכוון או שימוש לרעה</li>
              <li>נזק משימוש מחוץ לייעוד</li>
              <li>נזק קיים שלא דווח באיסוף</li>
              <li>נזק ממשתמשים לא מורשים</li>
              <li>נזקים עקיפים או תוצאתיים</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">4. מגבלות כיסוי</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              הכיסוי מוגבל לשווי הפריט המוצהר בעת הפרסום. סכום הכיסוי המרבי נקבע על ידי המשאיל ולא יכול לעלות על שווי השוק של הפריט.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">5. השתתפות עצמית</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              ייתכן שתחול השתתפות עצמית בתביעות ביטוח. גובה ההשתתפות יוצג בבירור בעת ההזמנה וינוכה מתשלום התביעה.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">6. הגשת תביעה</h2>
            <p className="mb-2 font-assistant text-[14px] text-[#888888]">להגשת תביעת ביטוח:</p>
            <ol className="ms-4 list-inside list-decimal space-y-1 font-assistant text-[14px] text-[#888888]">
              <li>דווח על האירוע מיד דרך הפלטפורמה</li>
              <li>ספק תמונות ותיאור מפורט של הנזק</li>
              <li>במקרה גניבה — ספק תעודת משטרה</li>
              <li>שתף פעולה עם תהליך בירור התביעה</li>
              <li>אפשר בדיקה של הפריט אם מתבקש</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">7. עיבוד תביעות</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              תביעות מעובדות בדרך כלל תוך 5–10 ימי עסקים. ייתכן שיידרשו מסמכים או מידע נוספים. תביעות שאושרו ישולמו לפי תנאי הכיסוי.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">8. אחריות המשאיל</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              על המשאיל להצהיר במדויק על שווי הפריטים ולדווח על נזק קיים. המשאיל אחראי לתחזוקת הפריטים במצב טוב ולמתן תיאורים מדויקים.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">9. אחריות השוכר</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              על השוכר להשתמש בפריטים רק לפי ייעודם ולפי הוראות המשאיל. השוכר חייב לדווח על נזק מיד ולשתף פעולה עם תהליך התביעה.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">10. מחלוקות</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              מחלוקות לגבי תביעות ביטוח ייבחנו על ידי צוות יישוב המחלוקות. ההחלטות מתקבלות על בסיס הראיות ותנאי המדיניות.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">11. שינויי מדיניות</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              לפלטפורמה שמורה הזכות לשנות את תנאי הביטוח. שינויים יפורסמו למשתמשים ויחולו על הזמנות שנעשו לאחר תאריך השינוי.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[16px] font-black text-black">12. יצירת קשר</h2>
            <p className="font-assistant text-[14px] text-[#888888]">
              לשאלות על כיסוי ביטוח או להגשת תביעה: insurance@lendly.com
            </p>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
