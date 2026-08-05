"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { StartRentalButton } from "@/components/start-rental-button";
import { FinishBookingButton } from "@/components/finish-booking-button";

type Cta = { label: string; href: string };

type Props = {
  bookingId: string;
  status: string;
  pickupDone: boolean;
  returnDone: boolean;
  cta: Cta;
};

export function BookingStickyCTA({ bookingId, status, pickupDone, returnDone, cta }: Props) {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);

  function onFinishSuccess() {
    setSuccess("✅ ההזמנה הושלמה בהצלחה");
    router.refresh();
  }

  return (
    <StickyCTA>
      {success && (
        <div className="mb-3 rounded-xl bg-muted p-3 text-right text-sm">
          {success}
        </div>
      )}
      {status === "CONFIRMED" && pickupDone ? (
        <StartRentalButton bookingId={bookingId} />
      ) : status === "ACTIVE" && returnDone ? (
        <FinishBookingButton bookingId={bookingId} onSuccess={onFinishSuccess} />
      ) : cta.href ? (
        <Button asChild className="w-full">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      ) : (
        <Button className="w-full" disabled>
          {cta.label}
        </Button>
      )}
    </StickyCTA>
  );
}
