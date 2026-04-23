"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { getListingStatusLabel, getListingStatusPillVariant } from "@/lib/status-labels";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { AdminNav } from "@/components/admin-nav";
import { PageContainer } from "@/components/layout";

type Listing = {
  id: string;
  title: string;
  category: string;
  city: string;
  pricePerDay: number;
  status: string;
  createdAt: string;
  images: { url: string; order: number }[];
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_APPROVAL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/listings?status=${encodeURIComponent(statusFilter)}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError("אין הרשאה");
            return;
          }
          setError("שגיאה בטעינה");
          return;
        }
        const data = await res.json();
        setListings(data.listings ?? []);
      } catch {
        setError("שגיאה בטעינה");
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  const handleAction = async (id: string, action: "approve" | "reject", reason?: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason ?? undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error ?? "שגיאה");
        return;
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("שגיאה");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-title">מודעות – ביקורת מנהל</h1>
        <AdminNav />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-xl border border-border/70 bg-card p-2">
        {["PENDING_APPROVAL", "ACTIVE", "REJECTED", "PAUSED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`brand-chip shrink-0 ${
              statusFilter === s ? "brand-chip-active" : "brand-chip-idle"
            }`}
          >
            {getListingStatusLabel(s)}
          </button>
        ))}
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
          <LoadingBlock message="טוען מודעות..." variant="full" />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          variant="full"
          title="אין מודעות בסטטוס זה"
          subtitle="נסה לבחור סטטוס אחר או המתן למודעות חדשות."
        />
      ) : (
        <ul className="space-y-4">
          {listings.map((l) => (
            <li key={l.id}>
              <Card className="shadow-soft">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        <Link href={`/listing/${l.id}`} className="hover:underline">
                          {l.title}
                        </Link>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getCategoryLabel(l.category)} · {l.city} · {formatMoneyIls(l.pricePerDay)} ליום
                        {l.ownerName != null && ` · בעלים: ${l.ownerName}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(l.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <StatusPill variant={getListingStatusPillVariant(l.status)} className="shrink-0">
                      {getListingStatusLabel(l.status)}
                    </StatusPill>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {l.images?.[0] && (
                    <div className="mb-2 h-20 w-24 rounded-md overflow-hidden bg-muted">
                      <img src={l.images[0].url} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {statusFilter === "PENDING_APPROVAL" && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAction(l.id, "approve")}
                        disabled={acting === l.id}
                      >
                        {acting === l.id ? "..." : "אשר"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = window.prompt("סיבת דחייה (אופציונלי):");
                          handleAction(l.id, "reject", reason ?? undefined);
                        }}
                        disabled={acting === l.id}
                      >
                        דחה
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      </PageContainer>
    </div>
  );
}
