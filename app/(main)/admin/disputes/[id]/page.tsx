export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { formatMoneyIls } from "@/lib/pricing";
import { getDisputeStatusLabel, getDisputeReasonLabel } from "@/lib/status-labels";
import ResolveDisputeForm from "./resolve-form";
import { PageContainer } from "@/components/layout";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";

async function getDispute(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/admin/disputes/${id}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  return res.json();
}

async function ensureAdmin() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return false;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return false;
  const data = await res.json();
  const me = data.user || data;
  return !!me?.isAdmin;
}

const ANGLE_LABELS: Record<string, string> = {
  front: "מבט קדמי",
  side: "מבט צד",
  accessories: "אביזרים",
};

const DISPUTE_PILL: Record<string, RedesignStatusVariant> = {
  OPEN: "warning",
  UNDER_REVIEW: "brand",
  RESOLVED_OWNER: "success",
  RESOLVED_RENTER: "success",
  RESOLVED_SPLIT: "success",
  CLOSED: "muted",
};

export default async function AdminDisputeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const { id } = await props.params;
  const dispute = await getDispute(id);

  if (!dispute) {
    return (
      <div className="p-6 text-center" dir="rtl">
        <p className="font-sans font-bold text-black">מחלוקת לא נמצאה</p>
        <Link href="/admin/disputes" className="text-[#1A8C6A] font-sans font-bold hover:underline mt-2 inline-block">חזרה למחלוקות</Link>
      </div>
    );
  }

  const booking = dispute.booking;
  const pickupPhotos = (booking.checklistPhotos ?? []).filter((p: { type: string }) => p.type === "pickup");
  const returnPhotos = (booking.checklistPhotos ?? []).filter((p: { type: string }) => p.type === "return");

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
      <div>
        <Link href="/admin/disputes" className="inline-flex items-center gap-1 font-assistant text-[13px] text-[#888888] hover:text-black">
          <ArrowRight className="h-4 w-4" />
          חזרה למחלוקות
        </Link>
      </div>

      <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">מחלוקת – צפייה מנהל</h1>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">פרטי המחלוקת</h2>
        </div>
        <div className="space-y-2 font-assistant text-[13px] text-black">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-sans font-bold text-black">סטטוס:</span>
            <RedesignStatusPill variant={DISPUTE_PILL[dispute.status] ?? "muted"}>
              {getDisputeStatusLabel(dispute.status)}
            </RedesignStatusPill>
          </p>
          <p><span className="font-sans font-bold text-black">סיבה:</span> <span className="text-[#888888]">{getDisputeReasonLabel(dispute.reason)}</span></p>
          <p><span className="font-sans font-bold text-black">נפתח:</span> <span className="text-[#888888]">{new Date(dispute.createdAt).toLocaleString("he-IL")}</span></p>
          {dispute.resolvedAt && (
            <p><span className="font-sans font-bold text-black">נסגר:</span> <span className="text-[#888888]">{new Date(dispute.resolvedAt).toLocaleString("he-IL")}</span></p>
          )}
          {["RESOLVED_OWNER", "RESOLVED_RENTER", "RESOLVED_SPLIT", "CLOSED"].includes(dispute.status) && (
            <p className="pt-2 border-t border-black/10">
              <span className="font-sans font-bold text-black">החלטה:</span>{" "}
              <span className="text-[#888888]">{getDisputeStatusLabel(dispute.status)}</span>
            </p>
          )}
          {dispute.adminNote && (
            <p><span className="font-sans font-bold text-black">הערת מנהל:</span> <span className="text-[#888888]">{dispute.adminNote}</span></p>
          )}
          {dispute.adminReasonCode && (
            <p><span className="font-sans font-bold text-black">קוד סיבה מנהלי:</span> <span className="text-[#888888]">{dispute.adminReasonCode}</span></p>
          )}
          {dispute.resolutionOutcome && (
            <p><span className="font-sans font-bold text-black">תוצאת החלטה:</span> <span className="text-[#888888]">{dispute.resolutionOutcome}</span></p>
          )}
          {dispute.financialActionNote && (
            <p><span className="font-sans font-bold text-black">הערת פעולה פיננסית:</span> <span className="text-[#888888]">{dispute.financialActionNote}</span></p>
          )}
          {dispute.resolvedByAdminId && (
            <p><span className="font-sans font-bold text-black">נסגר ע״י מנהל:</span> <span className="text-[#888888]">{dispute.resolvedByAdminId}</span></p>
          )}
          {dispute.resolutionNote && (
            <p><span className="font-sans font-bold text-black">הערת סיום:</span> <span className="text-[#888888]">{dispute.resolutionNote}</span></p>
          )}
          {dispute.evidenceChecklist && (
            <p><span className="font-sans font-bold text-black">בסיס ראיות:</span> <span className="text-[#888888]">{dispute.evidenceChecklist}</span></p>
          )}
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">פרטי ההזמנה</h2>
        </div>
        <div className="space-y-1 font-assistant text-[13px] text-black">
          <p><span className="font-sans font-bold">מודעה:</span> {booking.listing?.title}</p>
          <p><span className="font-sans font-bold">שוכר:</span> {booking.user?.name}</p>
          <p><span className="font-sans font-bold">תאריכים:</span> {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}</p>
          <p><span className="font-sans font-bold">פיקדון:</span> {booking.listing ? formatMoneyIls(booking.listing.deposit) : "—"}</p>
          <Link href={`/admin/bookings/${booking.id}`} className="text-[#1A8C6A] hover:underline text-sm">צפה בהזמנה</Link>
        </div>
      </div>

      {booking.returnChecklist && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <div className="mb-2">
            <h2 className="font-sans text-[15px] font-black text-black">רשימת החזרה (הקשר המחלוקת)</h2>
          </div>
          <div className="space-y-2 font-assistant text-[13px] text-black">
            <p><span className="font-sans font-bold">נזק לדיווח:</span> {booking.returnChecklist.damageReported ? "כן" : "לא"}</p>
            <p><span className="font-sans font-bold">פריטים חסרים:</span> {booking.returnChecklist.missingItemsReported ? "כן" : "לא"}</p>
            {booking.returnChecklist.notes && (
              <p><span className="font-sans font-bold">הערות:</span> {booking.returnChecklist.notes}</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">תמונות איסוף והחזרה</h2>
        </div>
        <div className="space-y-4">
          {pickupPhotos.length > 0 && (
            <div>
              <p className="text-sm font-sans font-bold mb-2">תמונות איסוף</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pickupPhotos.map((p: { angle: string; url: string }) => (
                  <a key={`p-${p.angle}`} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded border overflow-hidden aspect-square bg-black/[0.03]">
                    <Image src={p.url} alt={p.angle} width={320} height={320} className="w-full h-full object-cover" unoptimized />
                    <p className="text-xs p-1 text-center">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {returnPhotos.length > 0 && (
            <div>
              <p className="text-sm font-sans font-bold mb-2">תמונות החזרה</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {returnPhotos.map((p: { angle: string; url: string }) => (
                  <a key={`r-${p.angle}`} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded border overflow-hidden aspect-square bg-black/[0.03]">
                    <Image src={p.url} alt={p.angle} width={320} height={320} className="w-full h-full object-cover" unoptimized />
                    <p className="text-xs p-1 text-center">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {pickupPhotos.length === 0 && returnPhotos.length === 0 && (
            <p className="text-sm text-[#888888]">אין תמונות.</p>
          )}
        </div>
      </div>

      {(dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW") && (
        <ResolveDisputeForm disputeId={dispute.id} />
      )}
      </PageContainer>
    </div>
  );
}
