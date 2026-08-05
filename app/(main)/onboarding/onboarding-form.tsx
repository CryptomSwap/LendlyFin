"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/layout";
import { RedesignButton } from "@/components/redesign/button";
import { RedesignInput } from "@/components/redesign/input";

type Props = {
  defaultName: string;
  defaultPhone: string;
  defaultCity: string;
};

export default function OnboardingForm({
  defaultName,
  defaultPhone,
  defaultCity,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(defaultName);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [city, setCity] = useState(defaultCity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          city: city.trim(),
        }),
      });
      const raw = await res.text();
      let payload: unknown = null;
      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch {
        payload = null;
      }
      const obj =
        payload && typeof payload === "object"
          ? (payload as { error?: unknown })
          : null;
      const apiError = obj?.error;
      const messageFromApi =
        typeof apiError === "string"
          ? apiError
          : apiError != null
            ? String(apiError)
            : null;

      if (!res.ok) {
        if (messageFromApi) {
          setError(`${messageFromApi} (HTTP ${res.status})`);
        } else if (res.status === 401) {
          setError("לא מורשה — נסה להתחבר מחדש.");
        } else if (raw.trimStart().startsWith("<!") || raw.trimStart().startsWith("<html")) {
          setError(
            `שגיאת שרת (HTTP ${res.status}). התקבלה תשובת HTML במקום JSON — בדוק לוגים ב-Vercel ו־DATABASE_URL.`
          );
        } else {
          setError(`שגיאה בעדכון (HTTP ${res.status}). פתח כלי מפתחים ← רשת ← PATCH /api/profile/onboarding לפרטים.`);
        }
        return;
      }
      // Force NextAuth JWT refresh so middleware sees updated onboardingComplete
      await fetch("/api/auth/session");
      router.push("/profile");
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SurfaceCard padding="lg">
      <p className="mb-5 font-sans text-[15px] font-black text-black">פרטי פרופיל</p>
      <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
        <RedesignInput
          id="onboarding-name"
          label="שם מלא"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם מלא"
          required
          dir="rtl"
        />
        <RedesignInput
          id="onboarding-phone"
          label="מספר טלפון"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="050-0000000"
          required
          dir="ltr"
        />
        <RedesignInput
          id="onboarding-city"
          label="עיר"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="עיר"
          required
          dir="rtl"
        />
        {error && (
          <div
            role="alert"
            className="rounded-[8px] border border-red-200 bg-red-50 p-3 font-assistant text-[13px] break-words text-red-600"
          >
            {error}
          </div>
        )}
        <RedesignButton type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "שומר…" : "המשך"}
        </RedesignButton>
      </form>
    </SurfaceCard>
  );
}
