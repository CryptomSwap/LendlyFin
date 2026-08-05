export const runtime = "nodejs";
import { headers } from "next/headers";
import { AdminNav } from "@/components/admin-nav";
import { redirect } from "next/navigation";
import { AdminUsersTable } from "./users-table";
import { PageContainer } from "@/components/layout";

async function getUsers(params: {
  q?: string;
  kycStatus?: string;
  suspended?: string;
  page?: string;
  limit?: string;
}) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return { users: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  const proto = h.get("x-forwarded-proto") ?? "http";
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.kycStatus) search.set("kycStatus", params.kycStatus);
  if (params.suspended) search.set("suspended", params.suspended);
  if (params.page) search.set("page", params.page);
  if (params.limit) search.set("limit", params.limit);
  const url = `${proto}://${host}/api/admin/users?${search.toString()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return { users: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  return res.json();
}

async function ensureAdmin() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return false;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return false;
  const data = await res.json();
  const me = data.user || data;
  return !!me?.isAdmin;
}

const KYC_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  IN_PROGRESS: "בתהליך",
  SUBMITTED: "נשלח",
  APPROVED: "מאומת",
  REJECTED: "נדחה",
};

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ q?: string; kycStatus?: string; suspended?: string; page?: string }>;
}) {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const searchParams = await props.searchParams;
  const { users, total, page, limit, totalPages } = await getUsers(searchParams);

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            משתמשים – מנהל
          </h1>
          <AdminNav />
        </div>

        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <h2 className="mb-3 font-sans text-[15px] font-black text-black">חיפוש וסינון</h2>
          <form
            method="get"
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto] xl:items-end"
          >
            <input
              type="text"
              name="q"
              placeholder="שם, אימייל או מזהה"
              defaultValue={searchParams.q}
              className="input-base w-full"
            />
            <select
              name="kycStatus"
              className="input-base w-full"
              defaultValue={searchParams.kycStatus ?? ""}
            >
              <option value="">כל סטטוס אימות</option>
              {Object.entries(KYC_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select
              name="suspended"
              className="input-base w-full"
              defaultValue={searchParams.suspended ?? ""}
            >
              <option value="">כל המשתמשים</option>
              <option value="false">לא מושעה</option>
              <option value="true">מושעה</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-bold text-white transition-colors hover:bg-[#157A5A] xl:w-auto"
            >
              חפש
            </button>
          </form>
        </div>

        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <h2 className="mb-3 font-sans text-[15px] font-black text-black">
            רשימת משתמשים ({total})
          </h2>
          <AdminUsersTable
            users={users}
            kycLabels={KYC_LABELS}
            page={page}
            totalPages={totalPages}
            limit={limit}
            currentParams={searchParams}
          />
        </div>
      </PageContainer>
    </div>
  );
}
