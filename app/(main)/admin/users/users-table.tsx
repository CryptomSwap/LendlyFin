import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import type { RedesignStatusVariant } from "@/components/redesign/status-pill";

type UserRow = {
  id: string;
  name: string;
  email: string | null;
  kycStatus: string | null;
  isAdmin: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string | null;
  listingsCount: number;
  bookingsCount: number;
  disputesOpenedCount: number;
};

const KYC_PILL: Record<string, RedesignStatusVariant> = {
  PENDING: "warning",
  IN_PROGRESS: "warning",
  SUBMITTED: "brand",
  APPROVED: "success",
  REJECTED: "danger",
};

export function AdminUsersTable({
  users,
  kycLabels,
  page,
  totalPages,
  limit,
  currentParams,
}: {
  users: UserRow[];
  kycLabels: Record<string, string>;
  page: number;
  totalPages: number;
  limit: number;
  currentParams: { q?: string; kycStatus?: string; suspended?: string };
}) {
  const base = new URLSearchParams();
  if (currentParams.q) base.set("q", currentParams.q);
  if (currentParams.kycStatus) base.set("kycStatus", currentParams.kycStatus);
  if (currentParams.suspended) base.set("suspended", currentParams.suspended);
  base.set("limit", String(limit));

  if (users.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="אין משתמשים התואמים את הסינון."
        className="py-6"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                שם
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                אימייל
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                אימות
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                מושעה
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                מודעות
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                הזמנות
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]">
                מחלוקות
              </th>
              <th className="px-3 py-2.5 text-right font-sans text-[12px] font-bold text-[#888888]" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-black/10 transition-colors hover:bg-black/[0.02]"
              >
                <td className="px-3 py-2.5">
                  <span className="font-sans text-[13px] font-bold text-black">{u.name}</span>
                  {u.isAdmin && (
                    <span className="mr-1 font-assistant text-[11px] text-[#888888]">(מנהל)</span>
                  )}
                </td>
                <td className="px-3 py-2.5" dir="ltr">
                  <span className="font-assistant text-[13px] text-[#888888]">
                    {u.email ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {u.kycStatus ? (
                    <RedesignStatusPill variant={KYC_PILL[u.kycStatus] ?? "muted"}>
                      {kycLabels[u.kycStatus] ?? u.kycStatus}
                    </RedesignStatusPill>
                  ) : (
                    <span className="font-assistant text-[13px] text-[#888888]">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {u.suspendedAt ? (
                    <RedesignStatusPill variant="warning">מושעה</RedesignStatusPill>
                  ) : (
                    <span className="font-assistant text-[13px] text-[#888888]">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-assistant text-[13px] text-black">
                  {u.listingsCount}
                </td>
                <td className="px-3 py-2.5 font-assistant text-[13px] text-black">
                  {u.bookingsCount}
                </td>
                <td className="px-3 py-2.5 font-assistant text-[13px] text-black">
                  {u.disputesOpenedCount}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="font-sans text-[13px] font-bold text-[#1A8C6A] hover:underline"
                  >
                    צפה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {page > 1 && (
            <Link
              href={`/admin/users?${base.toString()}&page=${page - 1}`}
              className="font-sans text-[13px] font-bold text-[#1A8C6A] hover:underline"
            >
              ← הקודם
            </Link>
          )}
          <span className="font-assistant text-[13px] text-[#888888]">
            עמוד {page} מתוך {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?${base.toString()}&page=${page + 1}`}
              className="font-sans text-[13px] font-bold text-[#1A8C6A] hover:underline"
            >
              הבא →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
