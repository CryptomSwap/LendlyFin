"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Alert } from "@/components/ui/alert";
import { getCategoryLabel } from "@/lib/constants";
import { formatMoneyIls } from "@/lib/pricing";
import { getListingStatusLabel, getListingStatusPillVariant } from "@/lib/status-labels";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";
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
  ownerName?: string | null;
  status: string;
  createdAt: string;
  coverImageUrl?: string | null;
};

function toRedesignVariant(
  variant: ReturnType<typeof getListingStatusPillVariant>
): RedesignStatusVariant {
  return variant === "primary" ? "brand" : variant;
}

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
    if (acting) return;
    setActing(id);
    setListings((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: action === "approve" ? "ACTIVE" : "REJECTED" } : l
      )
    );
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason ?? undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error ?? "שגיאה");
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "PENDING_APPROVAL" } : l))
        );
        return;
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("שגיאה");
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "PENDING_APPROVAL" } : l))
      );
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (acting) return;
    if (!window.confirm(`למחוק את המודעה "${title}"? פעולה זו בלתי הפיכה.`)) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error ?? "שגיאה במחיקה");
        return;
      }
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("שגיאה במחיקה");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            מודעות – ביקורת מנהל
          </h1>
          <AdminNav />
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-[8px] border border-black/10 bg-white p-2">
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
          <Alert variant="error" className="mb-2">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="rounded-[8px] border border-black/10 bg-white p-8">
            <LoadingBlock message="טוען מודעות..." variant="full" />
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            variant="full"
            title="אין מודעות בסטטוס זה"
            subtitle="נסה לבחור סטטוס אחר או המתן למודעות חדשות."
          />
        ) : (
          <ul className="space-y-3">
            {listings.map((l) => (
              <li key={l.id}>
                <div className="rounded-[8px] border border-black/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/listing/${l.id}`}
                        className="font-sans text-[15px] font-black text-black hover:text-[#1A8C6A]"
                      >
                        {l.title}
                      </Link>
                      <p className="mt-0.5 font-assistant text-[12px] text-[#888888]">
                        {getCategoryLabel(l.category)} · {l.city} · {formatMoneyIls(l.pricePerDay)}{" "}
                        ליום
                        {l.ownerName != null && ` · בעלים: ${l.ownerName}`}
                      </p>
                      <p className="font-assistant text-[12px] text-[#888888]">
                        {new Date(l.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                    <RedesignStatusPill
                      variant={toRedesignVariant(getListingStatusPillVariant(l.status))}
                      className="shrink-0"
                    >
                      {getListingStatusLabel(l.status)}
                    </RedesignStatusPill>
                  </div>
                  {l.coverImageUrl && (
                    <div className="mt-2 h-20 w-24 overflow-hidden rounded-[8px] border border-black/10 bg-black/[0.03]">
                      <Image
                        src={l.coverImageUrl}
                        alt=""
                        width={96}
                        height={80}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {statusFilter === "PENDING_APPROVAL" && l.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(l.id, "approve")}
                          disabled={acting !== null}
                          className="rounded-full bg-[#1A8C6A] px-4 py-1.5 font-sans text-[13px] font-bold text-white transition-colors hover:bg-[#157A5A] disabled:opacity-50"
                        >
                          {acting === l.id ? "מאשר..." : "אשר"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reason = window.prompt("סיבת דחייה (אופציונלי):");
                            handleAction(l.id, "reject", reason ?? undefined);
                          }}
                          disabled={acting !== null}
                          className="rounded-full border border-black/15 bg-white px-4 py-1.5 font-sans text-[13px] font-bold text-black transition-colors hover:bg-black/5 disabled:opacity-50"
                        >
                          דחה
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="rounded-full border border-red-300 px-4 py-1.5 font-sans text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      onClick={() => handleDelete(l.id, l.title)}
                      disabled={acting !== null}
                    >
                      {acting === l.id ? "מוחק..." : "מחק"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
