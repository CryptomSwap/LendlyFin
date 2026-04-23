import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Shield, CheckCircle2, AlertTriangle, FileCheck, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafetyPage() {
  return (
    <div className="min-h-screen w-full app-page-bg space-y-6 pb-24 max-w-4xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="page-title mb-2">בטיחות ואמון</h1>
        <p className="text-sm text-muted-foreground">
          למד על אמצעי הבטיחות ותכונות בניית האמון שלנו
        </p>
      </div>

      <div className="mb-8">
        <TrustStrip />
      </div>

      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-primary" />
              תהליך אימות
            </CardTitle>
            <CardDescription>
              איך אנחנו מאמתים זהויות ובונים אמון
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  אימות זהות
                </h3>
                <p className="text-sm text-muted-foreground">
                  משתמשים שמעוניינים לפרסם מודעות נדרשים לאמת את זהותם בהעלאת תעודת זהות. זה מסייע להבטיח שכל אחד בפלטפורמה הוא מי שהוא טוען שהוא.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  אימות אימייל
                </h3>
                <p className="text-sm text-muted-foreground">
                  כל המשתמשים צריכים לאמת את כתובת האימייל בעת יצירת חשבון. זה מסייע במניעת חשבונות מזויפים ומבטיח שנוכל ליצור איתך קשר לגבי ההזמנות.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  אימות טלפון (בקרוב)
                </h3>
                <p className="text-sm text-muted-foreground">
                  אנחנו עובדים על הוספת אימות מספר טלפון לשכבת אבטחה נוספת.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <Link href="/profile/kyc">
                <Button className="w-full sm:w-auto">אמת את החשבון שלך</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              ציון אמון
            </CardTitle>
            <CardDescription>
              איך אנחנו מחשבים ומציגים את רמת האמינות של המשתמש
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">מהו ציון אמון?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  ציון האמון הוא דירוג מספרי (0–100) שמשקף את האמינות והאמון שלך בפלטפורמה. הוא מחושב לפי כמה גורמים:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>הזמנות שהושלמו ללא בעיות</li>
                  <li>ביקורות חיוביות ממשתמשים אחרים</li>
                  <li>מצב אימות החשבון</li>
                  <li>זמן תגובה להודעות</li>
                  <li>החזרות ואיסופים בזמן</li>
                  <li>היסטוריית מחלוקות</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">איך לשפר את ציון האמון</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  דרכים לבנות ולשמור על ציון אמון גבוה:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>השלם הזמנות בהצלחה</li>
                  <li>החזר פריטים בזמן ובמצב טוב</li>
                  <li>הגב להודעות במהירות</li>
                  <li>השאר ביקורות כנות לאחר עסקאות</li>
                  <li>אמת את החשבון</li>
                  <li>הימנע מביטולים ומחלוקות</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">למה ציון אמון חשוב</h3>
                <p className="text-sm text-muted-foreground">
                  משאילים נוטים לאשר הזמנות ממשתמשים עם ציון אמון גבוה יותר. גם שוכרים מעדיפים להזמין ממשאילים עם ציון אמון טוב. ציון גבוה יכול לסייע לקבל יותר הזמנות ולפרסם יותר מודעות.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              יישוב מחלוקות
            </CardTitle>
            <CardDescription>
              איך אנחנו מטפלים בסכסוכים ומחלוקות בין משתמשים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">מהי מחלוקת?</h3>
                <p className="text-sm text-muted-foreground">
                  מחלוקת מתעוררת כשיש חילוקי דעות בין שוכר למשאיל, כמו נזק לפריט, פריטים חסרים או בעיות תשלום. שני הצדדים יכולים לפתוח מחלוקת דרך הפלטפורמה.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">איך מחלוקות נפתרות</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  צוות התמיכה בודק מחלוקות על ידי:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>בדיקת תמונות וראיות משני הצדדים</li>
                  <li>בדיקת פרטי ההזמנה והיסטוריית התקשורת</li>
                  <li>בחינת דוחות מצב באיסוף ובהחזרה</li>
                  <li>קבלת החלטה הוגנת לפי מדיניות הפלטפורמה</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">תוצאות מחלוקת</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  תוצאות אפשריות:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ms-4">
                  <li>החזר פיקדון מלא לשוכר</li>
                  <li>ניכוי חלקי לתיקונים</li>
                  <li>ניכוי מלא לנזק משמעותי או אובדן</li>
                  <li>חיובים נוספים אם הנזק עולה על גובה הפיקדון</li>
                </ul>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">חשוב</h4>
                    <p className="text-sm text-muted-foreground">
                      תעד תמיד את מצב הפריטים בתמונות באיסוף ובהחזרה. הראיות האלה חיוניות ליישוב הוגן של מחלוקות.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              טיפים לבטיחות
            </CardTitle>
            <CardDescription>
              שיטות עבודה מומלצות להשכרה ופרסום בטוחים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">לשוכרים</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>קרא תיאורים וביקורות לפני ההזמנה</li>
                  <li>תקשר עם משאילים דרך מערכת ההודעות</li>
                  <li>בדוק פריטים ביסודיות באיסוף ותעד נזק קיים</li>
                  <li>השתמש בפריטים רק לפי הייעוד והוראות השימוש</li>
                  <li>החזר בזמן ובאותו מצב</li>
                  <li>דווח על בעיות מיד למשאיל</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">למשאילים</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>ספק תיאורים מדויקים ותמונות ברורות</li>
                  <li>הגדר תעריפים וזמינות ריאליסטיים</li>
                  <li>הגב במהירות לבקשות הזמנה והודעות</li>
                  <li>תעד מצב פריט לפני ואחרי כל השכרה</li>
                  <li>היה זמין לתיאום איסוף והחזרה</li>
                  <li>השאר ביקורות כנות לאחר השכרות</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
