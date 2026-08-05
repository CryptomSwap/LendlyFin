import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Shield, CheckCircle2, AlertTriangle, FileCheck, MessageSquare, Scale } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FAF6]">
            <Shield className="h-7 w-7 text-[#1A8C6A]" />
          </div>
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            בטיחות ואמון
          </h1>
          <p className="mt-2 font-assistant text-[15px] text-[#888888]">
            עקרונות הבטיחות של Lendly בהתאם לתנאי השימוש, מדיניות הפרטיות ומדיניות הביטולים וההחזרים
          </p>
        </div>

        <div className="mb-4">
          <TrustStrip />
        </div>

        <div className="space-y-4">
          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">תהליך אימות</h2>
            </div>
            <p className="mb-4 font-assistant text-[13px] text-[#888888]">
              אימות חשבון וזהות (KYC) לפי תנאי השימוש
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-sans text-[14px] font-black text-black">
                  <CheckCircle2 className="h-4 w-4 text-[#1A8C6A]" />
                  אימות זהות
                </h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  Lendly רשאית לדרוש אימות זהות, כולל מסמכי זיהוי, צילום עצמי ופרטים משלימים, לצורכי מניעת הונאה, אבטחת פעילות ועמידה בדרישות דין.
                </p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-sans text-[14px] font-black text-black">
                  <CheckCircle2 className="h-4 w-4 text-[#1A8C6A]" />
                  פרטים נכונים ומעודכנים
                </h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  השימוש בפלטפורמה מותנה במסירת מידע נכון, מלא ומעודכן. מסירת מידע שגוי או אי שיתוף פעולה בתהליך KYC עלולים להוביל להגבלת חשבון, השעיה או סגירה.
                </p>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-sans text-[14px] font-black text-black">
                  <CheckCircle2 className="h-4 w-4 text-[#1A8C6A]" />
                  שימוש לבגירים בלבד
                </h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  השירות מיועד לבני 18 ומעלה בלבד.
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-black/10 pt-4">
              <Link
                href="/profile/kyc"
                className="inline-flex rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-[#157A5A]"
              >
                אמת את החשבון שלך
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">אחריות הפלטפורמה והתפקיד של Lendly</h2>
            </div>
            <p className="mb-4 font-assistant text-[13px] text-[#888888]">מה Lendly כן עושה ומה לא</p>
            <div className="space-y-3">
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">Lendly היא פלטפורמת תיווך טכנולוגית</h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  Lendly אינה צד להסכם ההשכרה בין משכיר לשוכר. העסקה נכרתת ישירות בין הצדדים, והם אחראים לקיום התחייבויותיהם.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">כספים ותשלומים</h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  כל התשלומים, הפיקדונות, ההחזרים והחיובים מעובדים באמצעות ספק תשלום מורשה בלבד. Lendly אינה מחזיקה כספי משתמשים ואינה מנהלת נאמנות (Escrow).
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">אחריות לפריטים</h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  המשכיר אחראי לספק תיאור מדויק ופריט תקין ובטוח; השוכר אחראי להשתמש באופן סביר ולהחזיר בזמן ובמצב דומה, למעט בלאי סביר.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">יישוב מחלוקות</h2>
            </div>
            <p className="mb-4 font-assistant text-[13px] text-[#888888]">
              עקרונות טיפול במחלוקות לפי תנאי השימוש
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">מהי מחלוקת?</h3>
                <p className="font-assistant text-[13px] text-[#888888]">
                  מחלוקת היא הליך פנימי לבירור טענות בין שוכר למשכיר בקשר להזמנה, למשל נזק, אובדן או הפרת תנאי השכרה.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">איך מחלוקות נפתרות</h3>
                <p className="mb-2 font-assistant text-[13px] text-[#888888]">
                  Lendly בוחנת מחלוקות על בסיס ראיות ונתוני מערכת:
                </p>
                <ul className="ms-4 list-inside list-disc space-y-1 font-assistant text-[13px] text-[#888888]">
                  <li>בדיקת תמונות וראיות משני הצדדים</li>
                  <li>בדיקת פרטי ההזמנה והיסטוריית התקשורת</li>
                  <li>בחינת דוחות מצב באיסוף ובהחזרה</li>
                  <li>הכרעה תפעולית לצורכי חלוקה כספית לפי מסמכי הפלטפורמה</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">תוצאות מחלוקת</h3>
                <p className="mb-2 font-assistant text-[13px] text-[#888888]">תוצאות אפשריות:</p>
                <ul className="ms-4 list-inside list-disc space-y-1 font-assistant text-[13px] text-[#888888]">
                  <li>החזר פיקדון מלא לשוכר</li>
                  <li>ניכוי חלקי לתיקונים</li>
                  <li>ניכוי מלא לנזק משמעותי או אובדן</li>
                  <li>חיוב נוסף במקרה שהנזק חורג מסכום הפיקדון (בהתאם למדיניות ולדין)</li>
                </ul>
              </div>
              <div className="rounded-[8px] border border-[#1A8C6A]/20 bg-[#F0FAF6] p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#1A8C6A]" />
                  <div>
                    <h4 className="mb-1 font-sans text-[13px] font-black text-black">חשוב</h4>
                    <p className="font-assistant text-[13px] text-[#888888]">
                      הכרעה תפעולית של Lendly אינה מחליפה סמכות שיפוטית ואינה מונעת פנייה לערכאות מוסמכות לפי דין.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#1A8C6A]" />
              <h2 className="font-sans text-[16px] font-black text-black">טיפים לבטיחות</h2>
            </div>
            <p className="mb-4 font-assistant text-[13px] text-[#888888]">
              התנהלות מומלצת להפחתת סיכונים ולהגנה על שני הצדדים
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">לשוכרים</h3>
                <ul className="ms-4 list-inside list-disc space-y-1 font-assistant text-[13px] text-[#888888]">
                  <li>קרא תיאורים וביקורות לפני ההזמנה</li>
                  <li>בצע תקשורת ותיעוד רק דרך הפלטפורמה</li>
                  <li>בדוק פריטים ביסודיות באיסוף ותעד נזק קיים</li>
                  <li>השתמש בפריטים רק לפי הייעוד והוראות השימוש</li>
                  <li>החזר בזמן ובאותו מצב</li>
                  <li>דווח על בעיות מיד למשאיל</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-sans text-[14px] font-black text-black">למשאילים</h3>
                <ul className="ms-4 list-inside list-disc space-y-1 font-assistant text-[13px] text-[#888888]">
                  <li>ספק תיאורים מדויקים ותמונות ברורות</li>
                  <li>פרסם רק פריטים חוקיים, בטוחים ובמצב תקין</li>
                  <li>הגב במהירות לבקשות הזמנה והודעות</li>
                  <li>תעד מצב פריט לפני ואחרי כל השכרה</li>
                  <li>היה זמין לתיאום איסוף והחזרה</li>
                  <li>זכור שבלאי טבעי וסביר אינו עילה לדרישה כספית</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-black/10 pt-4 font-assistant text-[13px] text-[#888888]">
              <p>למידע המשפטי המלא והמחייב, עיין במסמכים הבאים:</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/help/terms" className="font-semibold text-[#1A8C6A] underline underline-offset-4">
                  תנאי שימוש
                </Link>
                <Link href="/help/privacy" className="font-semibold text-[#1A8C6A] underline underline-offset-4">
                  מדיניות פרטיות
                </Link>
                <Link href="/help/refunds" className="font-semibold text-[#1A8C6A] underline underline-offset-4">
                  מדיניות ביטולים והחזרים
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
