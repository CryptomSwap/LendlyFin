"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QA_USER_IDS } from "@/lib/dev/qa-scenarios";
import { DEV_IMPERSONATION_LABELS } from "@/lib/auth/dev-impersonation";

const PERSONAS: { id: string; label: string; purpose: string }[] = [
  { id: QA_USER_IDS.ADMIN, label: DEV_IMPERSONATION_LABELS["admin-user"] ?? "Admin", purpose: "Admin flows, confirm payment, resolve disputes, KYC review" },
  { id: QA_USER_IDS.DEV_LENDER, label: DEV_IMPERSONATION_LABELS["dev-user"] ?? "Lender", purpose: "Owner dashboard, multiple ACTIVE listings" },
  { id: QA_USER_IDS.RENTER_MULTI_BOOKING, label: DEV_IMPERSONATION_LABELS["qa-renter"] ?? "Renter", purpose: "Renter with REQUESTED, CONFIRMED, ACTIVE, COMPLETED, DISPUTE bookings" },
  { id: QA_USER_IDS.RENTER_NO_BOOKINGS, label: DEV_IMPERSONATION_LABELS["qa-renter-no-bookings"] ?? "Renter (no bookings)", purpose: "Browse & request; no bookings yet" },
  { id: QA_USER_IDS.OWNER_APPROVED, label: DEV_IMPERSONATION_LABELS["qa-owner-approved"] ?? "Owner approved", purpose: "Owner with ACTIVE listings (Bike, Laptop, Kayak)" },
  { id: QA_USER_IDS.OWNER_PENDING_KYC, label: DEV_IMPERSONATION_LABELS["qa-owner-pending-kyc"] ?? "Owner pending KYC", purpose: "Listing PENDING_APPROVAL; KYC SUBMITTED" },
  { id: QA_USER_IDS.ONBOARDING_INCOMPLETE, label: DEV_IMPERSONATION_LABELS["qa-onboarding-incomplete"] ?? "Onboarding incomplete", purpose: "Missing phone/city; onboarding gate" },
  { id: QA_USER_IDS.KYC_SUBMITTED, label: DEV_IMPERSONATION_LABELS["qa-kyc-submitted"] ?? "KYC Submitted", purpose: "KYC SUBMITTED; cannot book until approved" },
  { id: QA_USER_IDS.KYC_REJECTED, label: DEV_IMPERSONATION_LABELS["qa-kyc-rejected"] ?? "KYC Rejected", purpose: "KYC REJECTED; resubmit flow" },
];

export default function QAPersonaSwitcher() {
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function impersonate(userId: string) {
    setLoading(userId);
    try {
      const res = await fetch("/api/dev/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function clearImpersonation() {
    setLoading("clear");
    try {
      const res = await fetch("/api/dev/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: null }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-base font-semibold">כניסה כ (Personas)</h2>
        <p className="text-xs text-muted-foreground">
          לחץ כדי להתחבר כ־משתמש – הדף יתרענן עם הסשן החדש.
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => clearImpersonation()}
          disabled={loading !== null}
          className="text-xs"
        >
          {loading === "clear" ? "…" : "נקה impersonation"}
        </Button>
        {PERSONAS.map(({ id, label, purpose }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => impersonate(id)}
            disabled={loading !== null}
            className="text-xs"
            title={purpose}
          >
            {loading === id ? "…" : label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
