export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout";
import PickupChecklistForm from "./pickup-form";

async function getBooking(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/bookings/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PickupPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const booking = await getBooking(id);

  if (!booking) {
    return (
      <div className="p-4">
        <p>הזמנה לא נמצאה</p>
        <Link href="/bookings" className="text-primary underline mt-2 inline-block">חזרה להזמנות</Link>
      </div>
    );
  }

  if (booking.status !== "CONFIRMED" && booking.status !== "ACTIVE") {
    return (
      <div className="p-4">
        <p>רשימת איסוף זמינה רק להזמנה מאושרת.</p>
        <Link href={`/bookings/${id}`} className="text-primary underline mt-2 inline-block">חזרה להזמנה</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
      <div>
        <Link
          href={`/bookings/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה להזמנה
        </Link>
      </div>
      <h1 className="page-title">רשימת איסוף</h1>
      <p className="text-sm text-muted-foreground">
        {booking.listing?.title} · {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}
      </p>
      <PickupChecklistForm bookingId={id} />
      </PageContainer>
    </div>
  );
}
