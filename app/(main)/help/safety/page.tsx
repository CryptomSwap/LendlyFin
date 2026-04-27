import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Shield, CheckCircle2, AlertTriangle, FileCheck, MessageSquare, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafetyPage() {
  return (
    <div className="min-h-screen w-full app-page-bg space-y-6 pb-24 max-w-4xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
        <h1 className="page-title mb-2">בטיחות ואמון</h1>
        <p className="text-sm text-muted-foreground">
          עקרונות הבטיחות של Lendly בהתאם לתנאי השימוש, מדיניות הפרטיות ומדיניות הביטולים וההחזרים
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
              אימות חשבון וזהות (KYC) לפי תנאי השימוש
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
                  Lendly רשאית לדרוש אימות זהות, כולל מסמכי זיהוי, צילום עצמי ופרטים משלימים, לצורכי מניעת הונאה, אבטחת פעילות ועמידה בדרישות דין.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  פרטים נכונים ומעודכנים
                </h3>
                <p className="text-sm text-muted-foreground">
                  השימוש בפלטפורמה מותנה במסירת מידע נכון, מלא ומעודכן. מסירת מידע שגוי או אי שיתוף פעולה בתהליך KYC עלולים להוביל להגבלת חשבון, השעיה או סגירה.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  שימוש לבגירים בלבד
                </h3>
                <p className="text-sm text-muted-foreground">
                  השירות מיועד לבני 18 ומעלה בלבד.
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
              <Scale className="h-5 w-5 text-primary" />
              אחריות הפלטפורמה והתפקיד של Lendly
            </CardTitle>
            <CardDescription>
              מה Lendly כן עושה ומה לא
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Lendly היא פלטפורמת תיווך טכנולוגית</h3>
                <p className="text-sm text-muted-foreground">
                  Lendly אינה צד להסכם ההשכרה בין משכיר לשוכר. העסקה נכרתת ישירות בין הצדדים, והם אחראים לקיום התחייבויותיהם.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">כספים ותשלומים</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  כל התשלומים, הפיקדונות, ההחזרים והחיובים מעובדים באמצעות ספק תשלום מורשה בלבד. Lendly אינה מחזיקה כספי משתמשים ואינה מנהלת נאמנות (Escrow).
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">אחריות לפריטים</h3>
                <p className="text-sm text-muted-foreground">
                  המשכיר אחראי לספק תיאור מדויק ופריט תקין ובטוח; השוכר אחראי להשתמש באופן סביר ולהחזיר בזמן ובמצב דומה, למעט בלאי סביר.
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
              עקרונות טיפול במחלוקות לפי תנאי השימוש
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">מהי מחלוקת?</h3>
                <p className="text-sm text-muted-foreground">
                  מחלוקת היא הליך פנימי לבירור טענות בין שוכר למשכיר בקשר להזמנה, למשל נזק, אובדן או הפרת תנאי השכרה.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">איך מחלוקות נפתרות</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Lendly בוחנת מחלוקות על בסיס ראיות ונתוני מערכת:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>בדיקת תמונות וראיות משני הצדדים</li>
                  <li>בדיקת פרטי ההזמנה והיסטוריית התקשורת</li>
                  <li>בחינת דוחות מצב באיסוף ובהחזרה</li>
                  <li>הכרעה תפעולית לצורכי חלוקה כספית לפי מסמכי הפלטפורמה</li>
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
                  <li>חיוב נוסף במקרה שהנזק חורג מסכום הפיקדון (בהתאם למדיניות ולדין)</li>
                </ul>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">חשוב</h4>
                    <p className="text-sm text-muted-foreground">
                      הכרעה תפעולית של Lendly אינה מחליפה סמכות שיפוטית ואינה מונעת פנייה לערכאות מוסמכות לפי דין.
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
              התנהלות מומלצת להפחתת סיכונים ולהגנה על שני הצדדים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">לשוכרים</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ms-4">
                  <li>קרא תיאורים וביקורות לפני ההזמנה</li>
                  <li>בצע תקשורת ותיעוד רק דרך הפלטפורמה</li>
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
                  <li>פרסם רק פריטים חוקיים, בטוחים ובמצב תקין</li>
                  <li>הגב במהירות לבקשות הזמנה והודעות</li>
                  <li>תעד מצב פריט לפני ואחרי כל השכרה</li>
                  <li>היה זמין לתיאום איסוף והחזרה</li>
                  <li>זכור שבלאי טבעי וסביר אינו עילה לדרישה כספית</li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-border text-sm text-muted-foreground space-y-2">
              <p>
                למידע המשפטי המלא והמחייב, עיין במסמכים הבאים:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/help/terms" className="text-primary underline underline-offset-4">
                  תנאי שימוש
                </Link>
                <Link href="/help/privacy" className="text-primary underline underline-offset-4">
                  מדיניות פרטיות
                </Link>
                <Link href="/help/refunds" className="text-primary underline underline-offset-4">
                  מדיניות ביטולים והחזרים
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
