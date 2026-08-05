export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BookingMessagesView } from "./messages-view";
import { PageContainer } from "@/components/layout";

async function getMessages(bookingId: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/bookings/${bookingId}/messages`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return null;
  return res.json();
}

async function getBookingContext(bookingId: string): Promise<{ title: string; bookingRef: string | null } | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/bookings/${bookingId}`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    title: data?.listing?.title ?? "הזמנה",
    bookingRef: data?.bookingRef ?? null,
  };
}

export default async function BookingMessagesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: bookingId } = await props.params;
  const [data, context] = await Promise.all([
    getMessages(bookingId),
    getBookingContext(bookingId),
  ]);

  if (!data) {
    redirect(`/bookings/${bookingId}`);
  }

  const title = context?.title ?? "הזמנה";
  const bookingRef = context?.bookingRef ?? null;

  return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-4 lg:max-w-[72rem]">
      <div className="flex items-center gap-2">
        <Link
          href={`/bookings/${bookingId}`}
          className="p-1 rounded-full hover:bg-black/5 flex items-center gap-1 font-assistant text-[14px] text-[#888888]"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה להזמנה
        </Link>
      </div>
      <header>
        <h1 className="page-title">הודעות – {title}</h1>
        {bookingRef && (
          <p className="font-assistant text-[14px] text-[#888888] mt-1 font-mono" dir="ltr">
            הזמנה {bookingRef}
          </p>
        )}
      </header>
      <BookingMessagesView
        bookingId={bookingId}
        initialMessages={data.messages}
        currentUserId={data.currentUserId}
      />
      </PageContainer>
    </div>
  );
}
