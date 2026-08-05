"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { CATEGORY_LIST, CITIES, getSubcategoriesForCategory } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { PageContainer, SurfaceCard } from "@/components/layout";
import { RedesignButton } from "@/components/redesign/button";
import { resolveListingImagePublicUrl } from "@/lib/listing-images";

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
  subcategory: string;
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
  subcategory: "",
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

const chipClass = (active: boolean, errored?: boolean) =>
  cn(
    "rounded-[8px] border px-3 py-2.5 text-right font-assistant text-[14px] transition-colors",
    active
      ? "border-[#1A8C6A] bg-[#F0FAF6] font-sans font-bold text-[#1A8C6A]"
      : "border-black/15 bg-white text-black hover:border-[#1A8C6A]/40",
    errored && !active && "border-red-400"
  );

export default function AddListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(emptyData);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  const resizeImageFile = async (file: File): Promise<File> => {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Failed to load image"));
        el.src = objectUrl;
      });
      const maxDim = 1200;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.82)
      );
      if (!blob) return file;
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const uploadListingImage = async (file: File): Promise<string> => {
    const prepared = await resizeImageFile(file);
    const form = new FormData();
    form.append("file", prepared);
    const res = await fetch("/api/listings/upload", { method: "POST", body: form });
    const text = await res.text();
    let body: { url?: string; error?: string };
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error("Upload failed: invalid server response");
    }
    if (!res.ok) {
      throw new Error(body.error ?? "Upload failed");
    }
    if (!body.url) throw new Error("Upload failed: missing URL");
    return body.url;
  };

  const previewImageUrl = (stored: string) =>
    resolveListingImagePublicUrl(stored, { allowInline: true }) ?? stored;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setUploadError(null);
    const addedUrls: string[] = [];
    let lastError: string | null = null;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type && !file.type.startsWith("image/")) continue;
      try {
        const url = await uploadListingImage(file);
        addedUrls.push(url);
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Upload failed";
        console.error("[listing-upload]", file.name, lastError);
      }
    }
    if (addedUrls.length > 0) {
      setData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...addedUrls] }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photos;
        return next;
      });
    } else {
      setUploadError(lastError ?? "לא הצלחנו להעלות את התמונה. נסה קובץ אחר.");
    }
    setUploading(false);
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
    const payload = {
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      category: data.category,
      subcategory: data.subcategory.trim() || undefined,
      city: data.city.trim(),
      pricePerDay: Number(data.pricePerDay),
      deposit: Number(data.deposit),
      valueEstimate: data.valueEstimate.trim() ? Number(data.valueEstimate) : null,
      pickupNote: data.pickupNote.trim() || null,
      rules: data.rules.trim() || null,
      imageUrls: data.imageUrls,
    };
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as { error?: string; code?: string }));
        if (res.status === 401) {
          alert("נדרש להתחבר מחדש לפני פרסום מודעה.");
          router.push("/signin?callbackUrl=/add");
          setSubmitting(false);
          return;
        }
        alert(err?.error ?? `שגיאה בשמירת המודעה (קוד ${res.status})`);
        setSubmitting(false);
        return;
      }
      const listing = await res.json();
      if (listing?.imagesPersisted === false) {
        alert("המודעה נשמרה, אך חלק מהתמונות לא נשמרו. אפשר להוסיף תמונות מחדש במסך הניהול.");
      }
      router.push(`/listing/${listing.id}/manage`);
    } catch {
      alert("שגיאה בשמירת המודעה");
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="focus-visible:ring-[#1A8C6A]/40 -m-1 rounded-full p-2 hover:bg-black/5 focus-visible:ring-2"
            aria-label="חזור"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href="/"
            className="focus-visible:ring-[#1A8C6A]/40 -m-1 inline-flex rounded-full p-2 hover:bg-black/5 focus-visible:ring-2"
            aria-label="ביטול"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="min-w-0 flex-1 text-center font-sans text-[20px] font-black tracking-[-0.5px] text-black md:text-[24px]">
          הוספת מודעה
        </h1>
        <div className="w-9 shrink-0" aria-hidden />
      </div>
      <p className="mt-1.5 text-center font-assistant text-[13px] text-[#888888]">
        <span className="font-sans font-bold text-black">
          שלב {step} מתוך {TOTAL_STEPS}
        </span>
        <span> · {STEP_LABELS[step] ?? ""}</span>
      </p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-black/8"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`שלב ${step} מתוך ${TOTAL_STEPS}`}
      >
        <div
          className="h-full rounded-full bg-[#1A8C6A] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24" dir="rtl">
      {header}

      <main className="flex-1 py-4">
        <PageContainer width="narrow" className="lg:max-w-[62rem]">
        {/* Step 1: Basic info */}
        {step === 1 && (
          <SurfaceCard padding="lg">
            <h2 className="font-sans text-[20px] font-black text-black md:text-[24px]">מידע בסיסי</h2>
            <p className="mt-1 font-assistant text-[14px] text-[#888888]">
              כותרת, קטגוריה ותיאור. פשוט וממוקד – מלא את השדות הבאים.
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <label className="form-label" htmlFor="add-title">כותרת *</label>
                <Input
                  id="add-title"
                  value={data.title}
                  onChange={(e) => update({ title: e.target.value.slice(0, MAX_TITLE) })}
                  placeholder="למשל: מצלמת Canon EOS R5"
                  aria-invalid={errors.title}
                  aria-describedby={errors.title ? "add-title-error" : undefined}
                />
                <p className="form-helper">{data.title.length}/{MAX_TITLE}</p>
                {errors.title && (
                  <p id="add-title-error" className="form-error" role="alert">
                    נא להזין כותרת למודעה
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">קטגוריה *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_LIST.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => update({ category: c.slug, subcategory: "" })}
                      className={chipClass(data.category === c.slug, errors.category)}
                      aria-pressed={data.category === c.slug}
                    >
                      {c.labelHe}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="form-error" role="alert">נא לבחור קטגוריה</p>
                )}
              </div>
              {data.category && getSubcategoriesForCategory(data.category).length > 0 && (
                <div>
                  <label className="form-label">תת־קטגוריה (אופציונלי)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {getSubcategoriesForCategory(data.category).map((sub) => (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() =>
                          update({ subcategory: data.subcategory === sub.slug ? "" : sub.slug })
                        }
                        className={chipClass(data.subcategory === sub.slug)}
                        aria-pressed={data.subcategory === sub.slug}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="form-label" htmlFor="add-desc">תיאור (אופציונלי)</label>
                <textarea
                  id="add-desc"
                  value={data.description}
                  onChange={(e) => update({ description: e.target.value.slice(0, MAX_DESCRIPTION) })}
                  placeholder="תאר את מצב הפריט, מה כלול, למי מתאים..."
                  rows={3}
                  className="input-base w-full min-h-[80px] resize-y"
                />
                <p className="form-helper">{data.description.length}/{MAX_DESCRIPTION}</p>
              </div>
            </div>
          </SurfaceCard>
        )}

        {/* Step 2: Pricing & deposit */}
        {step === 2 && (
          <SurfaceCard padding="lg">
            <h2 className="font-sans text-[20px] font-black text-black md:text-[24px]">תמחור ומיקום</h2>
            <p className="mt-1 font-assistant text-[14px] text-[#888888]">
              מחיר ליום, פיקדון ועיר. השוכר ישלם לפי המחיר ליום שהגדרת.
            </p>
            <div className="mt-5 space-y-5">
              <section className="space-y-3" aria-label="תמחור">
                <h3 className="font-sans text-[14px] font-bold text-black">תמחור</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="form-label" htmlFor="add-price">מחיר ליום (₪) *</label>
                    <Input
                      id="add-price"
                      type="number"
                      min={0}
                      value={data.pricePerDay}
                      onChange={(e) => update({ pricePerDay: e.target.value })}
                      placeholder="0"
                      aria-invalid={errors.pricePerDay}
                    />
                    {errors.pricePerDay && (
                      <p className="form-error" role="alert">נא להזין מחיר תקין</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="add-deposit">פיקדון (₪) *</label>
                    <Input
                      id="add-deposit"
                      type="number"
                      min={0}
                      value={data.deposit}
                      onChange={(e) => update({ deposit: e.target.value })}
                      placeholder="0"
                      aria-invalid={errors.deposit}
                    />
                    {errors.deposit && (
                      <p className="form-error" role="alert">נא להזין פיקדון תקין</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="add-value">שווי משוער (₪) – אופציונלי</label>
                  <Input
                    id="add-value"
                    type="number"
                    min={0}
                    value={data.valueEstimate}
                    onChange={(e) => update({ valueEstimate: e.target.value })}
                    placeholder="למשל לצורך חישוב פיקדון/ביטוח"
                  />
                  <p className="form-helper">הערכת שווי הפריט (לא חובה)</p>
                </div>
              </section>
              <div className="border-t border-black/10 pt-4">
                <h3 className="mb-3 font-sans text-[14px] font-bold text-black">מיקום</h3>
                <label className="form-label" htmlFor="add-city">עיר *</label>
                <select
                  id="add-city"
                  value={data.city}
                  onChange={(e) => update({ city: e.target.value })}
                  className={cn("input-base w-full", errors.city && "border-red-400")}
                  aria-invalid={errors.city}
                >
                  <option value="">בחר עיר</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="form-error" role="alert">נא לבחור עיר</p>
                )}
              </div>
            </div>
          </SurfaceCard>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <SurfaceCard padding="lg">
            <h2 className="font-sans text-[20px] font-black text-black md:text-[24px]">תמונות</h2>
            <p className="mt-1 font-assistant text-[14px] text-[#888888]">
              תמונה טובה מעלה סיכוי להשכרה. העלה לפחות תמונה אחת (ניתן להוסיף כמה).
            </p>
            <div className="mt-5 space-y-4">
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
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-[8px] border border-dashed border-black/20 py-8 font-assistant text-[#888888] transition-colors hover:border-[#1A8C6A]/50 hover:bg-[#F0FAF6] hover:text-[#1A8C6A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImagePlus className="h-10 w-10" aria-hidden />
                <span className="font-sans text-[14px] font-bold">
                  {uploading ? "מעלה תמונות..." : "הוסף תמונות"}
                </span>
                <span className="text-[12px]">לחיצה לבחירת קבצים מהמכשיר</span>
              </button>
              {uploadError && <Alert variant="error">{uploadError}</Alert>}
              {data.imageUrls.length > 0 && (
                <ul className="space-y-2">
                  {data.imageUrls.map((url, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-[8px] border border-black/10 bg-white p-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewImageUrl(url)} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="flex-1 font-assistant text-[14px] text-[#888888]">
                        תמונה {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="rounded-full px-3 py-1 font-sans text-[13px] font-bold text-red-500 hover:bg-red-50"
                      >
                        הסר
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.photos && (
                <Alert variant="error">נא להעלות לפחות תמונה אחת</Alert>
              )}
            </div>
          </SurfaceCard>
        )}

        {/* Step 4: Extra (pickup / rules / availability placeholder) */}
        {step === 4 && (
          <SurfaceCard padding="lg">
            <h2 className="font-sans text-[20px] font-black text-black md:text-[24px]">
              איסוף, כללים וזמינות
            </h2>
            <p className="mt-1 font-assistant text-[14px] text-[#888888]">
              כמעט סיימנו. פרטים אלה אופציונליים – ניתן לעדכן גם אחרי הפרסום.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="form-label" htmlFor="add-pickup">הוראות איסוף (אופציונלי)</label>
                <Input
                  id="add-pickup"
                  value={data.pickupNote}
                  onChange={(e) => update({ pickupNote: e.target.value })}
                  placeholder="למשל: איסוף עצמי מתל אביב, או משלוח בתוספת תשלום"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="add-rules">כללים (אופציונלי)</label>
                <textarea
                  id="add-rules"
                  value={data.rules}
                  onChange={(e) => update({ rules: e.target.value })}
                  placeholder="כללי שימוש, הגבלות..."
                  rows={2}
                  className="input-base w-full min-h-[80px] resize-y"
                />
              </div>
              <div className="space-y-2 rounded-[8px] border border-[#1A8C6A]/15 bg-[#F0FAF6] p-4 font-assistant text-[13px] text-[#888888]">
                <p className="font-sans text-[14px] font-bold text-black">ניהול זמינות</p>
                <p>
                  אחרי פרסום המודעה תוכל לנהל תאריכים חסומים (מתי הפריט לא זמין להשכרה) בעמוד ניהול המודעה.
                  כרגע המודעה תהיה זמינה בכל התאריכים עד שתגדיר חסימות.
                </p>
                <p className="text-[12px] text-[#AAAAAA]">
                  מיד לאחר שליחת המודעה תועבר לעמוד ניהול זמינות.
                </p>
              </div>
            </div>
          </SurfaceCard>
        )}

        {/* Step 5: Review & submit */}
        {step === 5 && (
          <SurfaceCard padding="lg">
            <h2 className="font-sans text-[20px] font-black text-black md:text-[24px]">סיכום ושליחה</h2>
            <p className="mt-1 font-assistant text-[14px] text-[#888888]">
              בדוק שהכל מדויק ולחץ לפרסום. המודעה תעבור לאישור לפני שהיא תופיע בחיפוש.
            </p>
            <div className="mt-5 space-y-5">
              <section className="space-y-3">
                <h3 className="font-sans text-[14px] font-bold text-black">מידע בסיסי</h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-assistant text-[12px] text-[#888888]">כותרת</p>
                    <p className="font-sans font-bold text-black">{data.title || "—"}</p>
                  </div>
                  <div>
                    <p className="font-assistant text-[12px] text-[#888888]">קטגוריה</p>
                    <p className="font-sans font-bold text-black">
                      {CATEGORY_LIST.find((c) => c.slug === data.category)?.labelHe ?? (data.category || "—")}
                      {data.subcategory
                        ? ` · ${getSubcategoriesForCategory(data.category).find((s) => s.slug === data.subcategory)?.label ?? data.subcategory}`
                        : ""}
                    </p>
                  </div>
                  {data.description && (
                    <div>
                      <p className="font-assistant text-[12px] text-[#888888]">תיאור</p>
                      <p className="line-clamp-3 font-assistant text-[14px] text-black">{data.description}</p>
                    </div>
                  )}
                </div>
              </section>
              <div className="space-y-3 border-t border-black/10 pt-4">
                <h3 className="font-sans text-[14px] font-bold text-black">תמחור ומיקום</h3>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="font-assistant text-[12px] text-[#888888]">מחיר ליום</p>
                    <p className="font-sans font-bold text-black">
                      {formatMoneyIls(Number(data.pricePerDay) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="font-assistant text-[12px] text-[#888888]">פיקדון</p>
                    <p className="font-sans font-bold text-black">
                      {formatMoneyIls(Number(data.deposit) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="font-assistant text-[12px] text-[#888888]">עיר</p>
                    <p className="font-sans font-bold text-black">{data.city || "—"}</p>
                  </div>
                  {data.valueEstimate.trim() && (
                    <div>
                      <p className="font-assistant text-[12px] text-[#888888]">שווי משוער</p>
                      <p className="font-sans font-bold text-black">
                        {formatMoneyIls(Number(data.valueEstimate) || 0)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-black/10 pt-4">
                <p className="font-assistant text-[12px] text-[#888888]">תמונות</p>
                <p className="font-sans font-bold text-black">{data.imageUrls.length} תמונות</p>
              </div>
              {(data.pickupNote.trim() || data.rules.trim()) && (
                <div className="space-y-3 border-t border-black/10 pt-4">
                  <h3 className="font-sans text-[14px] font-bold text-black">פרטים נוספים</h3>
                  {data.pickupNote.trim() && (
                    <div>
                      <p className="font-assistant text-[12px] text-[#888888]">הוראות איסוף</p>
                      <p className="font-assistant text-[14px] text-black">{data.pickupNote}</p>
                    </div>
                  )}
                  {data.rules.trim() && (
                    <div>
                      <p className="font-assistant text-[12px] text-[#888888]">כללים</p>
                      <p className="whitespace-pre-wrap font-assistant text-[14px] text-black">
                        {data.rules}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SurfaceCard>
        )}
        </PageContainer>
      </main>

      <div className="sticky bottom-16 inset-x-0 z-10 mx-auto w-full max-w-md border-t border-black/10 bg-white px-4 py-4 md:bottom-4 md:max-w-4xl">
        {step < TOTAL_STEPS ? (
          <RedesignButton className="w-full" size="lg" onClick={handleNext}>
            המשך
          </RedesignButton>
        ) : (
          <RedesignButton
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "שולח..." : "פרסם מודעה"}
          </RedesignButton>
        )}
      </div>
    </div>
  );
}
