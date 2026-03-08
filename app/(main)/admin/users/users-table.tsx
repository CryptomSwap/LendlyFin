import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

type UserRow = {
  id: string;
  name: string;
  kycStatus: string | null;
  isAdmin: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string | null;
  listingsCount: number;
  bookingsCount: number;
  disputesOpenedCount: number;
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
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right py-2 px-2 font-medium">שם</th>
              <th className="text-right py-2 px-2 font-medium">אימות</th>
              <th className="text-right py-2 px-2 font-medium">מושעה</th>
              <th className="text-right py-2 px-2 font-medium">מודעות</th>
              <th className="text-right py-2 px-2 font-medium">הזמנות</th>
              <th className="text-right py-2 px-2 font-medium">מחלוקות</th>
              <th className="text-right py-2 px-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="py-2 px-2">
                  <span className="font-medium">{u.name}</span>
                  {u.isAdmin && <span className="text-muted-foreground text-xs mr-1">(מנהל)</span>}
                </td>
                <td className="py-2 px-2">{kycLabels[u.kycStatus ?? ""] ?? u.kycStatus ?? "—"}</td>
                <td className="py-2 px-2">
                  {u.suspendedAt ? (
                    <span className="text-amber-600">מושעה</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2 px-2">{u.listingsCount}</td>
                <td className="py-2 px-2">{u.bookingsCount}</td>
                <td className="py-2 px-2">{u.disputesOpenedCount}</td>
                <td className="py-2 px-2">
                  <Link href={`/admin/users/${u.id}`} className="text-primary hover:underline">
                    צפה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 flex-wrap justify-center pt-2">
          {page > 1 && (
            <Link
              href={`/admin/users?${base.toString()}&page=${page - 1}`}
              className="text-sm text-primary hover:underline"
            >
              ← הקודם
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            עמוד {page} מתוך {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?${base.toString()}&page=${page + 1}`}
              className="text-sm text-primary hover:underline"
            >
              הבא →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
