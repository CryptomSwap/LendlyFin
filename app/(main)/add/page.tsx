"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_LIST, CITIES } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { ArrowLeft, ImagePlus } from "lucide-react";

const TOTAL_STEPS = 5;
const MAX_TITLE = 80;
const MAX_DESCRIPTION = 500;

const STEP_LABELS: Record<number, string> = {
  1: "מידע בסיסי",
  2: "תמחור ומיקום",
  3: "תמונות",
  4: "איסוף וכללים",
  5: "סיכום",
};

type WizardData = {
  category: string;
  title: string;
  description: string;
  pricePerDay: string;
  deposit: string;
  city: string;
  valueEstimate: string;
  imageUrls: string[];
  pickupNote: string;
  rules: string;
};

const emptyData: WizardData = {
  category: "",
  title: "",
  description: "",
  pricePerDay: "",
  deposit: "",
  city: "",
  valueEstimate: "",
  imageUrls: [],
  pickupNote: "",
  rules: "",
};

export default function AddListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(emptyData);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(partial).forEach((k) => delete next[k]);
      return next;
    });
  };

  const progressPct = (step / TOTAL_STEPS) * 100;

  // Step 1: Basic info
  const validateStep1 = () => {
    const e: Record<string, boolean> = {};
    if (!data.title.trim()) e.title = true;
    if (!data.category) e.category = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 2: Pricing & deposit
  const validateStep2 = () => {
    const e: Record<string, boolean> = {};
    const price = Number(data.pricePerDay);
    const dep = Number(data.deposit);
    if (!data.pricePerDay.trim() || isNaN(price) || price < 0) e.pricePerDay = true;
    if (!data.deposit.trim() || isNaN(dep) || dep < 0) e.deposit = true;
    if (!data.city.trim()) e.city = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 3: Photos
  const validateStep3 = () => {
    if (data.imageUrls.length === 0) {
      setErrors({ photos: true });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const formData = new FormData();
      formData.set("file", file);
      try {
        const res = await fetch("/api/listings/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) continue;
        const { url } = await res.json();
        update({ imageUrls: [...data.imageUrls, url] });
      } catch {
        // skip failed upload
      }
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    update({ imageUrls: data.imageUrls.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description.trim() || undefined,
          category: data.category,
          city: data.city.trim(),
          pricePerDay: Number(data.pricePerDay),
          deposit: Number(data.deposit),
          valueEstimate: data.valueEstimate.trim() ? Number(data.valueEstimate) : null,
          pickupNote: data.pickupNote.trim() || null,
          rules: data.rules.trim() || null,
          imageUrls: data.imageUrls,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error ?? "שגיאה בשמירת המודעה");
        setSubmitting(false);
        return;
      }
      const listing = await res.json();
      router.push(`/listing/${listing.id}/manage`);
    } catch {
      alert("שגיאה בשמירת המודעה");
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        {step > 1 ? (
          <button type="button" onClick={handleBack} className="p-2 -m-1 rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-label="חזור">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link href="/" className="p-2 -m-1 rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring inline-flex" aria-label="ביטול">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="page-title text-center flex-1 min-w-0">הוספת מודעה</h1>
        <div className="w-9 shrink-0" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground mt-1.5 text-center">
        <span className="font-medium text-foreground">שלב {step} מתוך {TOTAL_STEPS}</span>
        <span className="text-muted-foreground"> · {STEP_LABELS[step] ?? ""}</span>
      </p>
      <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`שלב ${step} מתוך ${TOTAL_STEPS}`}>
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>
    </header>
  );

  return (
    <div className="min-h-screen flex flex-col pb-24" dir="rtl">
      {header}

      <main className="flex-1 px-4 py-4">
        {/* Step 1: Basic info */}
        {step === 1 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="section-title">מידע בסיסי</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">כותרת, קטגוריה ותיאור. פשוט וממוקד – מלא את השדות הבאים.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="add-title">כותרת *</label>
                <Input
                  id="add-title"
                  value={data.title}
                  onChange={(e) => update({ title: e.target.value.slice(0, MAX_TITLE) })}
                  placeholder="למשל: מצלמת Canon EOS R5"
                  className={cn(errors.title && "border-destructive")}
                  aria-invalid={errors.title}
                  aria-describedby={errors.title ? "add-title-error" : undefined}
                />
                <p className="text-xs text-muted-foreground mt-0.5">{data.title.length}/{MAX_TITLE}</p>
                {errors.title && <p id="add-title-error" className="text-xs text-destructive mt-1" role="alert">נא להזין כותרת למודעה</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">קטגוריה *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_LIST.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => update({ category: c.slug })}
                      className={cn(
                        "py-2.5 px-3 rounded-lg border text-sm text-right transition-colors",
                        data.category === c.slug
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                        errors.category && "border-destructive"
                      )}
                      aria-pressed={data.category === c.slug}
                    >
                      {c.labelHe}
                    </button>
                  ))}
                </div>
                {errors.category && <p className="text-xs text-destructive mt-1" role="alert">נא לבחור קטגוריה</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="add-desc">תיאור (אופציונלי)</label>
                <textarea
                  id="add-desc"
                  value={data.description}
                  onChange={(e) => update({ description: e.target.value.slice(0, MAX_DESCRIPTION) })}
                  placeholder="תאר את מצב הפריט, מה כלול, למי מתאים..."
                  rows={3}
                  className="input-base w-full min-h-[80px] resize-y"
                />
                <p className="text-xs text-muted-foreground mt-0.5">{data.description.length}/{MAX_DESCRIPTION}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pricing & deposit */}
        {step === 2 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="section-title">תמחור ומיקום</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">מחיר ליום, פיקדון ועיר. השוכר ישלם לפי המחיר ליום שהגדרת.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <section className="space-y-3" aria-label="תמחור">
                <h3 className="text-sm font-semibold text-foreground">תמחור</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="add-price">מחיר ליום (₪) *</label>
                    <Input
                      id="add-price"
                      type="number"
                      min={0}
                      value={data.pricePerDay}
                      onChange={(e) => update({ pricePerDay: e.target.value })}
                      placeholder="0"
                      className={cn(errors.pricePerDay && "border-destructive")}
                      aria-invalid={errors.pricePerDay}
                    />
                    {errors.pricePerDay && <p className="text-xs text-destructive mt-1" role="alert">נא להזין מחיר תקין</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="add-deposit">פיקדון (₪) *</label>
                    <Input
                      id="add-deposit"
                      type="number"
                      min={0}
                      value={data.deposit}
                      onChange={(e) => update({ deposit: e.target.value })}
                      placeholder="0"
                      className={cn(errors.deposit && "border-destructive")}
                      aria-invalid={errors.deposit}
                    />
                    {errors.deposit && <p className="text-xs text-destructive mt-1" role="alert">נא להזין פיקדון תקין</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="add-value">שווי משוער (₪) – אופציונלי</label>
                  <Input
                    id="add-value"
                    type="number"
                    min={0}
                    value={data.valueEstimate}
                    onChange={(e) => update({ valueEstimate: e.target.value })}
                    placeholder="למשל לצורך חישוב פיקדון/ביטוח"
                  />
                  <p className="text-xs text-muted-foreground mt-0.5">הערכת שווי הפריט (לא חובה)</p>
                </div>
              </section>
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">מיקום</h3>
                <label className="block text-sm font-medium mb-1" htmlFor="add-city">עיר *</label>
                <select
                  id="add-city"
                  value={data.city}
                  onChange={(e) => update({ city: e.target.value })}
                  className={cn("input-base w-full", errors.city && "border-destructive")}
                  aria-invalid={errors.city}
                >
                  <option value="">בחר עיר</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-xs text-destructive mt-1" role="alert">נא לבחור עיר</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="section-title">תמונות</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">תמונה טובה מעלה סיכוי להשכרה. העלה לפחות תמונה אחת (ניתן להוסיף כמה).</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <ImagePlus className="h-10 w-10" aria-hidden />
                <span className="text-sm font-medium">הוסף תמונות</span>
                <span className="text-xs">לחיצה לבחירת קבצים מהמכשיר</span>
              </button>
              {data.imageUrls.length > 0 && (
                <ul className="space-y-2">
                  {data.imageUrls.map((url, i) => (
                    <li key={url} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-muted/20">
                      <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm text-muted-foreground flex-1">תמונה {i + 1}</span>
                      <button type="button" onClick={() => removePhoto(i)} className="text-destructive text-sm font-medium py-1 px-2 rounded hover:bg-destructive/10">
                        הסר
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.photos && (
                <Alert variant="error">נא להעלות לפחות תמונה אחת</Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Extra (pickup / rules / availability placeholder) */}
        {step === 4 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="section-title">איסוף, כללים וזמינות</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">כמעט סיימנו. פרטים אלה אופציונליים – ניתן לעדכן גם אחרי הפרסום.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="add-pickup">הוראות איסוף (אופציונלי)</label>
                <Input
                  id="add-pickup"
                  value={data.pickupNote}
                  onChange={(e) => update({ pickupNote: e.target.value })}
                  placeholder="למשל: איסוף עצמי מתל אביב, או משלוח בתוספת תשלום"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="add-rules">כללים (אופציונלי)</label>
                <textarea
                  id="add-rules"
                  value={data.rules}
                  onChange={(e) => update({ rules: e.target.value })}
                  placeholder="כללי שימוש, הגבלות..."
                  rows={2}
                  className="input-base w-full min-h-[80px] resize-y"
                />
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">ניהול זמינות</p>
                <p>
                  אחרי פרסום המודעה תוכל לנהל תאריכים חסומים (מתי הפריט לא זמין להשכרה) בעמוד ניהול המודעה.
                  כרגע המודעה תהיה זמינה בכל התאריכים עד שתגדיר חסימות.
                </p>
                <p className="text-xs">
                  מיד לאחר שליחת המודעה תועבר לעמוד ניהול זמינות.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & submit */}
        {step === 5 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="section-title">סיכום ושליחה</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">בדוק שהכל מדויק ולחץ לפרסום. המודעה תעבור לאישור לפני שהיא תופיע בחיפוש.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">מידע בסיסי</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">כותרת</p>
                    <p className="font-medium text-foreground">{data.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">קטגוריה</p>
                    <p className="font-medium text-foreground">{(CATEGORY_LIST.find((c) => c.slug === data.category)?.labelHe) ?? (data.category || "—")}</p>
                  </div>
                  {data.description && (
                    <div>
                      <p className="text-xs text-muted-foreground">תיאור</p>
                      <p className="text-sm text-foreground line-clamp-3">{data.description}</p>
                    </div>
                  )}
                </div>
              </section>
              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">תמחור ומיקום</h3>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">מחיר ליום</p>
                    <p className="font-medium text-foreground">{formatMoneyIls(Number(data.pricePerDay) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">פיקדון</p>
                    <p className="font-medium text-foreground">{formatMoneyIls(Number(data.deposit) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">עיר</p>
                    <p className="font-medium text-foreground">{data.city || "—"}</p>
                  </div>
                  {data.valueEstimate.trim() && (
                    <div>
                      <p className="text-xs text-muted-foreground">שווי משוער</p>
                      <p className="font-medium text-foreground">{formatMoneyIls(Number(data.valueEstimate) || 0)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">תמונות</p>
                <p className="font-medium text-foreground">{data.imageUrls.length} תמונות</p>
              </div>
              {(data.pickupNote.trim() || data.rules.trim()) && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">פרטים נוספים</h3>
                  {data.pickupNote.trim() && (
                    <div>
                      <p className="text-xs text-muted-foreground">הוראות איסוף</p>
                      <p className="text-sm text-foreground">{data.pickupNote}</p>
                    </div>
                  )}
                  {data.rules.trim() && (
                    <div>
                      <p className="text-xs text-muted-foreground">כללים</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{data.rules}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <div className="sticky bottom-16 inset-x-0 z-10 bg-card border-t border-border shadow-cta-strip px-4 py-4">
        {step < TOTAL_STEPS ? (
          <Button className="w-full" size="lg" onClick={handleNext}>
            המשך
          </Button>
        ) : (
          <Button variant="gradient" size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "שולח..." : "פרסם מודעה"}
          </Button>
        )}
      </div>
    </div>
  );
}
