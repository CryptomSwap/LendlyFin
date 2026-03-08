import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, PlusCircle, Calendar, Shield, ArrowLeft } from "lucide-react";

export default function GettingStartedPage() {
  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Book className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="page-title mb-2">התחלה</h1>
        <p className="text-sm text-muted-foreground">
          למד איך להשתמש בפלטפורמה להשכרה או לפרסום מודעות
        </p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="h-5 w-5 text-primary" />
              איך ליצור מודעה
            </CardTitle>
            <CardDescription>
              מדריך שלב־אחר־שלב לפרסום פריטים להשכרה
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, title: "התחבר לחשבון", desc: "צור חשבון או התחבר. תצטרך לאמת את זהותך כדי לפרסם מודעות." },
                { step: 2, title: "לחץ על \"הוסף מודעה\"", desc: "עבור לדף המודעות ולחץ על \"הוסף מודעה\" או \"פרסם ציוד\"." },
                { step: 3, title: "מלא פרטי פריט", desc: "ספק כותרת, תיאור, קטגוריה, תעריף יומי והעלה תמונות." },
                { step: 4, title: "הגדר זמינות", desc: "השתמש בלוח השנה לסמן באילו תאריכים הפריט זמין." },
                { step: 5, title: "שלח לאישור", desc: "לאחר השליחה המודעה תיבדק על ידי הצוות לפני פרסום. בדרך כלל 24–48 שעות." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <Link href="/add">
                <Button className="w-full sm:w-auto">
                  צור מודעה ראשונה
                  <ArrowLeft className="me-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              איך להזמין פריט
            </CardTitle>
            <CardDescription>
              איך לשכור פריטים ממשתמשים אחרים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, title: "עיין בפריטים", desc: "השתמש בחיפוש או בקטגוריות. סנן לפי מיקום, מחיר וזמינות." },
                { step: 2, title: "בחר תאריכים", desc: "בחר תאריכי התחלה וסיום בדף הפריט. וודא שהפריט זמין." },
                { step: 3, title: "בדוק מחיר", desc: "בדוק את הסכום הכולל: תעריף יומי, פיקדון ביטחון וביטוח אופציונלי. הפיקדון מוחזר בהחזרה." },
                { step: 4, title: "שלח בקשת הזמנה", desc: "לחץ \"הזמן עכשיו\". למשאיל יש עד 12 שעות לאשר או לדחות." },
                { step: 5, title: "איסוף והחזרה", desc: "לאחר האישור תאם עם המשאיל לאיסוף. השלם צ'קליסט איסוף, השתמש בפריט והחזר באותו מצב." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <Link href="/search">
                <Button variant="outline" className="w-full sm:w-auto">
                  עיין בפריטים זמינים
                  <ArrowLeft className="me-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              הבנת פיקדונות
            </CardTitle>
            <CardDescription>
              איך פיקדונות ביטחון עובדים בפלטפורמה
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">מהו פיקדון ביטחון?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  פיקדון הביטחון הוא סכום להחזרה שמוחזק לכיסוי נזק או אובדן אפשריים. הוא מחושב לפי שווי הפריט ומשך ההשכרה.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">מתי גובים את הפיקדון?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  הפיקדון מאושר (אבל לא נגבה) בעת ביצוע ההזמנה. הוא נגבה רק אם המשאיל מאשר את ההזמנה.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">מתי מחזירים את הפיקדון?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  הפיקדון מוחזר במלואו כשמחזירים את הפריט באותו מצב. ההחזר בדרך כלל תוך 3–5 ימי עסקים.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">מה אם נגרם נזק?</h3>
                <p className="text-sm text-muted-foreground">
                  אם הפריט ניזוק או לא הוחזר, המשאיל יכול לפתוח מחלוקת. הצוות יבדוק ויכול לנכות מעלויות תיקון או החלפה מהפיקדון.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <Link href="/help/faq">
                <Button variant="outline" className="w-full sm:w-auto">
                  עוד שאלות נפוצות
                  <ArrowLeft className="me-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
