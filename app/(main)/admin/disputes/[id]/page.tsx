export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoneyIls } from "@/lib/pricing";
import { getDisputeStatusLabel, getDisputeReasonLabel } from "@/lib/status-labels";
import ResolveDisputeForm from "./resolve-form";
import { PageContainer } from "@/components/layout";

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
        <p className="font-medium text-foreground">מחלוקת לא נמצאה</p>
        <Link href="/admin/disputes" className="text-primary font-medium hover:underline mt-2 inline-block">חזרה למחלוקות</Link>
      </div>
    );
  }

  const booking = dispute.booking;
  const pickupPhotos = (booking.checklistPhotos ?? []).filter((p: { type: string }) => p.type === "pickup");
  const returnPhotos = (booking.checklistPhotos ?? []).filter((p: { type: string }) => p.type === "return");

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
      <div>
        <Link href="/admin/disputes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" />
          חזרה למחלוקות
        </Link>
      </div>

      <h1 className="page-title">מחלוקת – צפייה מנהל</h1>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">פרטי המחלוקת</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><span className="font-medium text-foreground">סטטוס:</span> <span className="text-muted-foreground">{getDisputeStatusLabel(dispute.status)}</span></p>
          <p><span className="font-medium text-foreground">סיבה:</span> <span className="text-muted-foreground">{getDisputeReasonLabel(dispute.reason)}</span></p>
          <p><span className="font-medium text-foreground">נפתח:</span> <span className="text-muted-foreground">{new Date(dispute.createdAt).toLocaleString("he-IL")}</span></p>
          {dispute.resolvedAt && (
            <p><span className="font-medium text-foreground">נסגר:</span> <span className="text-muted-foreground">{new Date(dispute.resolvedAt).toLocaleString("he-IL")}</span></p>
          )}
          {["RESOLVED_OWNER", "RESOLVED_RENTER", "RESOLVED_SPLIT", "CLOSED"].includes(dispute.status) && (
            <p className="pt-2 border-t border-border">
              <span className="font-medium text-foreground">החלטה:</span>{" "}
              <span className="text-muted-foreground">{getDisputeStatusLabel(dispute.status)}</span>
            </p>
          )}
          {dispute.adminNote && (
            <p><span className="font-medium text-foreground">הערת מנהל:</span> <span className="text-muted-foreground">{dispute.adminNote}</span></p>
          )}
          {dispute.adminReasonCode && (
            <p><span className="font-medium text-foreground">קוד סיבה מנהלי:</span> <span className="text-muted-foreground">{dispute.adminReasonCode}</span></p>
          )}
          {dispute.resolutionOutcome && (
            <p><span className="font-medium text-foreground">תוצאת החלטה:</span> <span className="text-muted-foreground">{dispute.resolutionOutcome}</span></p>
          )}
          {dispute.financialActionNote && (
            <p><span className="font-medium text-foreground">הערת פעולה פיננסית:</span> <span className="text-muted-foreground">{dispute.financialActionNote}</span></p>
          )}
          {dispute.resolvedByAdminId && (
            <p><span className="font-medium text-foreground">נסגר ע״י מנהל:</span> <span className="text-muted-foreground">{dispute.resolvedByAdminId}</span></p>
          )}
          {dispute.resolutionNote && (
            <p><span className="font-medium text-foreground">הערת סיום:</span> <span className="text-muted-foreground">{dispute.resolutionNote}</span></p>
          )}
          {dispute.evidenceChecklist && (
            <p><span className="font-medium text-foreground">בסיס ראיות:</span> <span className="text-muted-foreground">{dispute.evidenceChecklist}</span></p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">פרטי ההזמנה</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="font-medium">מודעה:</span> {booking.listing?.title}</p>
          <p><span className="font-medium">שוכר:</span> {booking.user?.name}</p>
          <p><span className="font-medium">תאריכים:</span> {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}</p>
          <p><span className="font-medium">פיקדון:</span> {booking.listing ? formatMoneyIls(booking.listing.deposit) : "—"}</p>
          <Link href={`/admin/bookings/${booking.id}`} className="text-primary hover:underline text-sm">צפה בהזמנה</Link>
        </CardContent>
      </Card>

      {booking.returnChecklist && (
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">רשימת החזרה (הקשר המחלוקת)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="font-medium">נזק לדיווח:</span> {booking.returnChecklist.damageReported ? "כן" : "לא"}</p>
            <p><span className="font-medium">פריטים חסרים:</span> {booking.returnChecklist.missingItemsReported ? "כן" : "לא"}</p>
            {booking.returnChecklist.notes && (
              <p><span className="font-medium">הערות:</span> {booking.returnChecklist.notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">תמונות איסוף והחזרה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pickupPhotos.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">תמונות איסוף</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pickupPhotos.map((p: { angle: string; url: string }) => (
                  <a key={`p-${p.angle}`} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded border overflow-hidden aspect-square bg-muted">
                    <img src={p.url} alt={p.angle} className="w-full h-full object-cover" />
                    <p className="text-xs p-1 text-center">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {returnPhotos.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">תמונות החזרה</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {returnPhotos.map((p: { angle: string; url: string }) => (
                  <a key={`r-${p.angle}`} href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded border overflow-hidden aspect-square bg-muted">
                    <img src={p.url} alt={p.angle} className="w-full h-full object-cover" />
                    <p className="text-xs p-1 text-center">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {pickupPhotos.length === 0 && returnPhotos.length === 0 && (
            <p className="text-sm text-muted-foreground">אין תמונות.</p>
          )}
        </CardContent>
      </Card>

      {(dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW") && (
        <ResolveDisputeForm disputeId={dispute.id} />
      )}
      </PageContainer>
    </div>
  );
}
