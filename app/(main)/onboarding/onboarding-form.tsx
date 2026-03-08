"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/profile";

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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.error as string) || "שגיאה בעדכון");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי פרופיל</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          <div className="form-group">
            <Label htmlFor="onboarding-name">שם מלא</Label>
            <Input
              id="onboarding-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם מלא"
              required
              className="w-full"
              dir="rtl"
            />
          </div>
          <div className="form-group">
            <Label htmlFor="onboarding-phone">מספר טלפון</Label>
            <Input
              id="onboarding-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="050-0000000"
              required
              className="w-full"
              dir="ltr"
            />
          </div>
          <div className="form-group">
            <Label htmlFor="onboarding-city">עיר</Label>
            <Input
              id="onboarding-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="עיר"
              required
              className="w-full"
              dir="rtl"
            />
          </div>
          {error && <Alert variant="error" role="alert">{error}</Alert>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "שומר…" : "המשך"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
