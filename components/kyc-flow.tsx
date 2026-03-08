"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SelfieCapture from "@/components/selfie-capture";
import IdCapture from "@/components/id-capture";
import Image from "next/image";

type Step = "instructions" | "selfie" | "id" | "review" | "submitting" | "success";

export default function KYCFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("instructions");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [idUrl, setIdUrl] = useState<string | null>(null);
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
          
          if (status === "SUBMITTED" || status === "APPROVED" || status === "REJECTED") {
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
    setSelfieUrl(null);
    setStep("selfie");
  };

  const handleRetakeId = () => {
    setIdFile(null);
    setIdUrl(null);
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
      setSelfieUrl(selfieData.url);

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
      setIdUrl(idData.url);

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
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">אימות זהות</h2>
              <p className="text-gray-600">
                כדי לאמת את זהותך, נדרשות שתי תמונות:
              </p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📸</div>
                  <div>
                    <h3 className="font-semibold">סלפי</h3>
                    <p className="text-sm text-gray-600">
                      צלם תמונה של עצמך עם הפנים שלך
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🆔</div>
                  <div>
                    <h3 className="font-semibold">תעודת זהות</h3>
                    <p className="text-sm text-gray-600">
                      צלם את תעודת הזהות או הדרכון שלך
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>טיפ:</strong> ודא שהתמונות ברורות ומוארות היטב
              </p>
            </div>

            <Button
              type="button"
              onClick={handleNext}
              className="w-full"
            >
              התחל
            </Button>
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
              <h2 className="text-xl font-semibold">בדוק את התמונות</h2>
              <p className="text-sm text-gray-600">
                ודא שהתמונות ברורות לפני השליחה
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-center">סלפי</h3>
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetakeSelfie}
                  className="w-full"
                >
                  צלם שוב
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-center">תעודת זהות</h3>
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetakeId}
                  className="w-full"
                >
                  צלם שוב
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        );

      case "submitting":
        return (
          <div className="text-center space-y-4 py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600">שולח את המסמכים...</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">✅</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">נשלח בהצלחה!</h2>
              <p className="text-gray-600">
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
  const canProceedToNext = 
    step === "instructions" ||
    (step === "selfie" && !!selfieFile) ||
    (step === "id" && !!idFile);

  if (checkingStatus) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-2 text-gray-600">בודק סטטוס...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {step !== "success" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 text-center">
            {step === "instructions" && "שלב 1/4 – הוראות"}
            {step === "selfie" && "שלב 2/4 – סלפי"}
            {step === "id" && "שלב 3/4 – תעודת זהות"}
            {step === "review" && "שלב 4/4 – בדיקה לפני שליחה"}
          </p>
          <div className="flex items-center gap-2">
          {["instructions", "selfie", "id", "review"].map((s, idx) => {
            const stepNames = ["הוראות", "סלפי", "תעודת זהות", "ביקורת"];
            const isActive = step === s;
            const isCompleted =
              (s === "instructions" && step !== "instructions") ||
              (s === "selfie" && (step === "id" || step === "review")) ||
              (s === "id" && step === "review");

            return (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex-1 flex items-center">
                  <div
                    className={`flex-1 h-1 rounded ${
                      isCompleted
                        ? "bg-blue-600"
                        : isActive
                        ? "bg-blue-300"
                        : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted
                        ? "bg-blue-600 text-white"
                        : isActive
                        ? "bg-blue-300 text-blue-900"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <div className="flex-1 h-1 rounded bg-gray-200" />
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
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              חזור
            </Button>
          )}
          {step === "review" ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1"
            >
              שלח לאימות
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
            >
              הבא
            </Button>
          )}
        </div>
      )}

      {step === "success" && (
        <Button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full"
        >
          חזור לפרופיל
        </Button>
      )}
    </div>
  );
}
