export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ManageListingAvailability from "./manage-client";
import { PageContainer } from "@/components/layout";

async function getListing(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/listings/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; title: string; status: string; pickupNote: string | null; rules: string | null }>;
}

export default async function ListingManagePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const listing = await getListing(id);

  if (!listing) {
    return (
      <div className="p-4">
        <p>מודעה לא נמצאה</p>
        <Link href="/" className="text-primary underline mt-2 inline-block">חזרה לדף הבית</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6 lg:max-w-[72rem]">
      <div className="flex items-center gap-2">
        <Link
          href={`/listing/${id}`}
          className="p-1 rounded-lg hover:bg-muted flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה למודעה
        </Link>
      </div>
      <ManageListingAvailability
        listingId={id}
        listingTitle={listing.title}
        listingStatus={listing.status}
        pickupNote={listing.pickupNote ?? ""}
        rules={listing.rules ?? ""}
      />
      </PageContainer>
    </div>
  );
}
