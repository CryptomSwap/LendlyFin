import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function InsuranceTermsPage() {
  return (
    <div className="min-h-screen w-full app-page-bg space-y-6 pb-24 max-w-4xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="page-title mb-2">תנאי ביטוח</h1>
        <p className="text-sm text-muted-foreground">
          עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}
        </p>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-5 sm:p-8 space-y-6 max-w-none">
          <section>
            <h2 className="text-lg font-semibold mb-4">1. סקירת כיסוי</h2>
            <p className="text-muted-foreground">
              הפלטפורמה מציעה כיסוי ביטוח אופציונלי לפריטים מושכרים. הכיסוי מספק הגנה מפני נזק, אובדן או גניבה במהלך תקופת ההשכרה.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">2. מה מכוסה</h2>
            <p className="text-muted-foreground mb-2">
              כיסוי הביטוח כולל:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ms-4">
              <li>נזק מקרי לפריט המושכר</li>
              <li>גניבת הפריט (עם תעודת משטרה)</li>
              <li>אובדן הפריט המושכר</li>
              <li>עלויות תיקון עד לשווי הפריט המוצהר</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">3. מה לא מכוסה</h2>
            <p className="text-muted-foreground mb-2">
              הביטוח לא מכסה:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ms-4">
              <li>בלאי רגיל</li>
              <li>נזק מכוון או שימוש לרעה</li>
              <li>נזק משימוש מחוץ לייעוד</li>
              <li>נזק קיים שלא דווח באיסוף</li>
              <li>נזק ממשתמשים לא מורשים</li>
              <li>נזקים עקיפים או תוצאתיים</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">4. מגבלות כיסוי</h2>
            <p className="text-muted-foreground">
              הכיסוי מוגבל לשווי הפריט המוצהר בעת הפרסום. סכום הכיסוי המרבי נקבע על ידי המשאיל ולא יכול לעלות על שווי השוק של הפריט.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">5. השתתפות עצמית</h2>
            <p className="text-muted-foreground">
              ייתכן שתחול השתתפות עצמית בתביעות ביטוח. גובה ההשתתפות יוצג בבירור בעת ההזמנה וינוכה מתשלום התביעה.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">6. הגשת תביעה</h2>
            <p className="text-muted-foreground mb-2">
              להגשת תביעת ביטוח:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ms-4">
              <li>דווח על האירוע מיד דרך הפלטפורמה</li>
              <li>ספק תמונות ותיאור מפורט של הנזק</li>
              <li>במקרה גניבה — ספק תעודת משטרה</li>
              <li>שתף פעולה עם תהליך בירור התביעה</li>
              <li>אפשר בדיקה של הפריט אם מתבקש</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">7. עיבוד תביעות</h2>
            <p className="text-muted-foreground">
              תביעות מעובדות בדרך כלל תוך 5–10 ימי עסקים. ייתכן שיידרשו מסמכים או מידע נוספים. תביעות שאושרו ישולמו לפי תנאי הכיסוי.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">8. אחריות המשאיל</h2>
            <p className="text-muted-foreground">
              על המשאיל להצהיר במדויק על שווי הפריטים ולדווח על נזק קיים. המשאיל אחראי לתחזוקת הפריטים במצב טוב ולמתן תיאורים מדויקים.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">9. אחריות השוכר</h2>
            <p className="text-muted-foreground">
              על השוכר להשתמש בפריטים רק לפי ייעודם ולפי הוראות המשאיל. השוכר חייב לדווח על נזק מיד ולשתף פעולה עם תהליך התביעה.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">10. מחלוקות</h2>
            <p className="text-muted-foreground">
              מחלוקות לגבי תביעות ביטוח ייבחנו על ידי צוות יישוב המחלוקות. ההחלטות מתקבלות על בסיס הראיות ותנאי המדיניות.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">11. שינויי מדיניות</h2>
            <p className="text-muted-foreground">
              לפלטפורמה שמורה הזכות לשנות את תנאי הביטוח. שינויים יפורסמו למשתמשים ויחולו על הזמנות שנעשו לאחר תאריך השינוי.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">12. יצירת קשר</h2>
            <p className="text-muted-foreground">
              לשאלות על כיסוי ביטוח או להגשת תביעה: insurance@lendly.com
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
