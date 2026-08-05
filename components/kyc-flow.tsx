"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RedesignButton } from "@/components/redesign/button";
import SelfieCapture from "@/components/selfie-capture";
import IdCapture from "@/components/id-capture";
import Image from "next/image";

type Step = "instructions" | "selfie" | "id" | "review" | "submitting" | "success";

export default function KYCFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("instructions");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check user's KYC status on mount to prevent re-submission
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          const status = user.kycStatus || "PENDING";
          
          // Keep rejected users in the flow so they can submit again.
          if (status === "SUBMITTED" || status === "APPROVED") {
            console.log("[KYC Flow] User already has status:", status);
            router.push("/profile");
            return;
          }
        }
      } catch (err) {
        console.error("[KYC Flow] Failed to check status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleSelfieCapture = (file: File) => {
    setSelfieFile(file);
    setError(null);
  };

  const handleIdCapture = (file: File) => {
    setIdFile(file);
    setError(null);
  };

  const handleNext = () => {
    if (step === "instructions") {
      setStep("selfie");
    } else if (step === "selfie") {
      if (!selfieFile) {
        setError("אנא צלם סלפי");
        return;
      }
      setStep("id");
    } else if (step === "id") {
      if (!idFile) {
        setError("אנא צלם תעודת זהות");
        return;
      }
      setStep("review");
    }
  };

  const handleBack = () => {
    if (step === "selfie") {
      setStep("instructions");
    } else if (step === "id") {
      setStep("selfie");
    } else if (step === "review") {
      setStep("id");
    }
  };

  const handleRetakeSelfie = () => {
    setSelfieFile(null);
    setStep("selfie");
  };

  const handleRetakeId = () => {
    setIdFile(null);
    setStep("id");
  };

  const handleSubmit = async () => {
    if (!selfieFile || !idFile) {
      setError("אנא ודא שצילמת את שתי התמונות");
      return;
    }

    setStep("submitting");
    setError(null);
    setUploading(true);

    console.log("[KYC] Starting submission process");

    try {
      // Upload selfie
      console.log("[KYC] Uploading selfie...");
      const selfieFormData = new FormData();
      selfieFormData.append("file", selfieFile);
      selfieFormData.append("type", "selfie");

      const selfieRes = await fetch("/api/kyc/upload", {
        method: "POST",
        body: selfieFormData,
      });

      if (!selfieRes.ok) {
        if (selfieRes.status === 401) {
          throw new Error(
            "לא מורשה (401). במצב פיתוח ודא ש‑DEV_AUTH_BYPASS=true ב‑.env.local והפעל מחדש את השרת."
          );
        }
        let errorMessage = "Failed to upload selfie";
        try {
          const errorData = await selfieRes.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await selfieRes.text();
          errorMessage = text || errorMessage;
        }
        console.error("[KYC] Selfie upload failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const selfieData = await selfieRes.json();
      console.log("[KYC] Selfie uploaded successfully:", selfieData.url);

      // Upload ID
      console.log("[KYC] Uploading ID...");
      const idFormData = new FormData();
      idFormData.append("file", idFile);
      idFormData.append("type", "id");

      const idRes = await fetch("/api/kyc/upload", {
        method: "POST",
        body: idFormData,
      });

      if (!idRes.ok) {
        if (idRes.status === 401) {
          throw new Error(
            "לא מורשה (401). במצב פיתוח ודא ש‑DEV_AUTH_BYPASS=true ב‑.env.local והפעל מחדש את השרת."
          );
        }
        let errorMessage = "Failed to upload ID";
        try {
          const errorData = await idRes.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await idRes.text();
          errorMessage = text || errorMessage;
        }
        console.error("[KYC] ID upload failed:", errorMessage);
        throw new Error(errorMessage);
      }

      const idData = await idRes.json();
      console.log("[KYC] ID uploaded successfully:", idData.url);

      // Submit KYC
      console.log("[KYC] Submitting KYC with URLs:", {
        selfieUrl: selfieData.url,
        idUrl: idData.url,
      });
      const submitRes = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selfieUrl: selfieData.url,
          idUrl: idData.url,
        }),
      });

      if (!submitRes.ok) {
        if (submitRes.status === 401) {
          throw new Error(
            "לא מורשה (401). במצב פיתוח ודא ש‑DEV_AUTH_BYPASS=true ב‑.env.local והפעל מחדש את השרת."
          );
        }
        let errorMessage = "Failed to submit KYC";
        try {
          const errorData = await submitRes.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await submitRes.text();
          errorMessage = text || errorMessage;
        }
        console.error("[KYC] Submission failed:", errorMessage);
        throw new Error(errorMessage);
      }

      // Validate response
      const submitData = await submitRes.json();
      console.log("[KYC] Submit response received:", submitData);

      if (!submitData.success || !submitData.user) {
        console.error("[KYC] Invalid response from server:", submitData);
        throw new Error("Invalid response from server");
      }

      if (submitData.user.kycStatus !== "SUBMITTED") {
        console.error("[KYC] Status not updated correctly:", submitData.user.kycStatus);
        throw new Error("KYC status was not updated correctly");
      }

      console.log("[KYC] KYC submitted successfully:", {
        userId: submitData.user.id,
        status: submitData.user.kycStatus,
        selfieUrl: submitData.user.kycSelfieUrl,
        idUrl: submitData.user.kycIdUrl,
        submittedAt: submitData.user.kycSubmittedAt,
      });

      setStep("success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה בשליחת המסמכים";
      console.error("[KYC] Submission error:", err);
      setError(errorMessage);
      setStep("review");
    } finally {
      setUploading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "instructions":
        return (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="font-sans text-[22px] font-black text-black">אימות זהות</h2>
              <p className="font-assistant text-[14px] text-[#888888]">
                כדי לאמת את זהותך, נדרשות שתי תמונות:
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-[8px] border border-black/10 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F0FAF6] text-lg">
                    📸
                  </div>
                  <div>
                    <h3 className="font-sans text-[15px] font-bold text-black">סלפי</h3>
                    <p className="font-assistant text-[13px] text-[#888888]">
                      צלם תמונה של עצמך עם הפנים שלך
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[8px] border border-black/10 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F0FAF6] text-lg">
                    🆔
                  </div>
                  <div>
                    <h3 className="font-sans text-[15px] font-bold text-black">תעודת זהות</h3>
                    <p className="font-assistant text-[13px] text-[#888888]">
                      צלם את תעודת הזהות או הדרכון שלך
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[8px] border border-[#1A8C6A]/15 bg-[#F0FAF6] p-4">
              <p className="font-assistant text-[13px] text-black">
                <strong className="font-sans">טיפ:</strong> ודא שהתמונות ברורות ומוארות היטב
              </p>
            </div>

            <RedesignButton type="button" onClick={handleNext} className="w-full" size="lg">
              התחל
            </RedesignButton>
          </div>
        );

      case "selfie":
        return (
          <SelfieCapture
            onCapture={handleSelfieCapture}
            currentImage={selfieFile ? URL.createObjectURL(selfieFile) : null}
          />
        );

      case "id":
        return (
          <IdCapture
            onCapture={handleIdCapture}
            currentImage={idFile ? URL.createObjectURL(idFile) : null}
          />
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-sans text-[20px] font-black text-black">בדוק את התמונות</h2>
              <p className="mt-1 font-assistant text-[13px] text-[#888888]">
                ודא שהתמונות ברורות לפני השליחה
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-center font-sans text-[13px] font-bold text-black">סלפי</h3>
                <div className="relative aspect-square overflow-hidden rounded-[8px] border border-black/10 bg-black/[0.03]">
                  {selfieFile && (
                    <Image
                      src={URL.createObjectURL(selfieFile)}
                      alt="Selfie"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <RedesignButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRetakeSelfie}
                  className="w-full"
                >
                  צלם שוב
                </RedesignButton>
              </div>

              <div className="space-y-2">
                <h3 className="text-center font-sans text-[13px] font-bold text-black">תעודת זהות</h3>
                <div className="relative aspect-square overflow-hidden rounded-[8px] border border-black/10 bg-black/[0.03]">
                  {idFile && (
                    <Image
                      src={URL.createObjectURL(idFile)}
                      alt="ID"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <RedesignButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRetakeId}
                  className="w-full"
                >
                  צלם שוב
                </RedesignButton>
              </div>
            </div>

            {error && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 p-3">
                <p className="font-assistant text-[13px] text-red-600">{error}</p>
              </div>
            )}
          </div>
        );

      case "submitting":
        return (
          <div className="space-y-4 py-8 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-[#1A8C6A]" />
            <p className="font-assistant text-[14px] text-[#888888]">שולח את המסמכים...</p>
          </div>
        );

      case "success":
        return (
          <div className="space-y-6 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FAF6] text-3xl">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="font-sans text-[22px] font-black text-black">נשלח בהצלחה!</h2>
              <p className="font-assistant text-[14px] text-[#888888]">
                המסמכים נשלחו לאימות. נבדוק אותם ונעדכן אותך בקרוב.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const showNavigation = step !== "instructions" && step !== "submitting" && step !== "success";

  // Determine if we can proceed to the next step
  if (checkingStatus) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#1A8C6A]" />
        <p className="mt-2 font-assistant text-[14px] text-[#888888]">בודק סטטוס...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {step !== "success" && (
        <div className="flex flex-col gap-2">
          <p className="text-center font-assistant text-[12px] text-[#888888]">
            {step === "instructions" && "שלב 1/4 – הוראות"}
            {step === "selfie" && "שלב 2/4 – סלפי"}
            {step === "id" && "שלב 3/4 – תעודת זהות"}
            {step === "review" && "שלב 4/4 – בדיקה לפני שליחה"}
          </p>
          <div className="flex items-center gap-2">
          {["instructions", "selfie", "id", "review"].map((s, idx) => {
            const isActive = step === s;
            const isCompleted =
              (s === "instructions" && step !== "instructions") ||
              (s === "selfie" && (step === "id" || step === "review")) ||
              (s === "id" && step === "review");

            return (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-1 items-center">
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      isCompleted
                        ? "bg-[#1A8C6A]"
                        : isActive
                        ? "bg-[#1A8C6A]/40"
                        : "bg-black/10"
                    }`}
                  />
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[11px] font-bold ${
                      isCompleted
                        ? "bg-[#1A8C6A] text-white"
                        : isActive
                        ? "bg-[#F0FAF6] text-[#1A8C6A]"
                        : "bg-black/8 text-[#888888]"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <div className="h-1 flex-1 rounded-full bg-black/10" />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {renderStep()}

      {/* Navigation buttons */}
      {showNavigation && (
        <div className="flex gap-2 pt-4">
          {step !== "selfie" && (
            <RedesignButton
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              חזור
            </RedesignButton>
          )}
          {step === "review" ? (
            <RedesignButton
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1"
            >
              שלח לאימות
            </RedesignButton>
          ) : (
            <RedesignButton
              type="button"
              onClick={handleNext}
              className="flex-1"
            >
              הבא
            </RedesignButton>
          )}
        </div>
      )}

      {step === "success" && (
        <RedesignButton
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full"
          size="lg"
        >
          חזור לפרופיל
        </RedesignButton>
      )}
    </div>
  );
}
