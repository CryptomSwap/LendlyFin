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
        <h1 className="page-title mb-2">איך להתחיל?</h1>
        <p className="text-sm text-muted-foreground">
          ככה משתמשים בפלטפורמה ומרוויחים כסף
        </p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="h-5 w-5 text-primary" />
              איך ליצור מודעה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, title: "התחברות לחשבון", desc: "יצירת חשבון או התחברות - צריך לאמת זהות כדי להתחיל לפרסם מודעות" },
                { step: 2, title: "כפתור \"פרסום מודעה\"", desc: "אפשר בדף המודעות או בדף הבית" },
                { step: 3, title: "מילוי פרטים", desc: "עדיף כמה שיותר פרטים כדי שהמשכיר יקבל את כל המידע שצריך לדעת לפני ההשכרה. פה זה גם המקום האישי שלך להיות יצירתי ואישי. תיאור, קטגוריה, תעריף יומי, תמונות \\ סרטונים וכו'." },
                { step: 4, title: "הגדרת זמינות", desc: "אפשר להשתמש בלוח השנה כדי להגביל תאריכים, גם תוך כדי שהמודעה באוויר אפשר לשנות כמובן" },
                { step: 5, title: "שליחה לאישור", desc: "הצוות שלנו יאשר את המודעה בדרך כלל תוך 24 שעות." },
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
                  יצירת מודעה ראשונה
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
              איך להזמין?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { step: 1, title: "חיפוש", desc: "חיפוש לפי קטגוריה, תאריכים, מיקום וכו'" },
                { step: 2, title: "בחירת תאריכים", desc: "לפי הזמינות של המשכיר, חשוב לוודא איסוף והחזרה" },
                { step: 3, title: "שליחת הזמנה ותשלום", desc: "למשכיר יש עד 12 שעות לאשר או לדחות את הבקשה" },
                { step: 4, title: "איסוף והחזרה", desc: "לאחר האישור המשכיר יתאם איתך קשר לגבי איסוף והחזרה. יש לעקוב אחרי ההוראות" },
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
                  מה יש לידך?
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
              פקדונות
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
