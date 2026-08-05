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
      <div className="min-h-screen w-full bg-white pb-24 p-4" dir="rtl">
        <p className="font-sans font-bold text-black">הזמנה לא נמצאה</p>
        <Link href="/bookings" className="font-sans font-bold text-[#1A8C6A] underline mt-2 inline-block">חזרה להזמנות</Link>
      </div>
    );
  }

  if (booking.status !== "CONFIRMED" && booking.status !== "ACTIVE") {
    return (
      <div className="min-h-screen w-full bg-white pb-24 p-4" dir="rtl">
        <p className="font-assistant text-[14px] text-[#888888]">רשימת איסוף זמינה רק להזמנה מאושרת.</p>
        <Link href={`/bookings/${id}`} className="font-sans font-bold text-[#1A8C6A] underline mt-2 inline-block">חזרה להזמנה</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-6 lg:max-w-[72rem]">
      <div>
        <Link
          href={`/bookings/${id}`}
          className="inline-flex items-center gap-1 font-assistant text-[14px] text-[#888888] hover:text-black"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה להזמנה
        </Link>
      </div>
      <h1 className="page-title">רשימת איסוף</h1>
      <p className="font-assistant text-[14px] text-[#888888]">
        {booking.listing?.title} · {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}
      </p>
      <PickupChecklistForm bookingId={id} />
      </PageContainer>
    </div>
  );
}
