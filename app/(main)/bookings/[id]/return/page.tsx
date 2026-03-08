export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ReturnChecklistForm from "./return-form";

async function getBooking(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/bookings/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ReturnPage(props: {
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

  if (booking.status !== "ACTIVE" && booking.status !== "COMPLETED" && booking.status !== "DISPUTE") {
    return (
      <div className="p-4">
        <p>רשימת החזרה זמינה רק להזמנה פעילה (אחרי איסוף).</p>
        <Link href={`/bookings/${id}`} className="text-primary underline mt-2 inline-block">חזרה להזמנה</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      <div>
        <Link
          href={`/bookings/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה להזמנה
        </Link>
      </div>
      <h1 className="page-title">רשימת החזרה</h1>
      <p className="text-sm text-muted-foreground">
        {booking.listing?.title} · {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}
      </p>
      <ReturnChecklistForm bookingId={id} />
    </div>
  );
}
