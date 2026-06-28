import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK = {
  recent7d: { recentUsers7d: 12, recentListings7d: 8, recentBookings7d: 23 },
  users: { totalUsers: 184, approvedKycUsers: 97, pendingKycUsers: 31, suspendedUsers: 4 },
  listings: { totalListings: 312, activeListings: 201, pendingApprovalListings: 14, rejectedListings: 22, pausedListings: 9, draftListings: 66 },
  bookings: { totalBookings: 540, requestedBookings: 18, confirmedBookings: 27, activeBookings: 11, completedBookings: 443, disputeBookings: 5 },
  disputes: { totalDisputes: 19, openDisputes: 5, resolvedDisputes: 14 },
};

const NAV = [
  { label: "מדדים",    href: "/admin/metrics",   active: true  },
  { label: "הזמנות",  href: "/admin/bookings",   active: false },
  { label: "מודעות",  href: "/admin/listings",   active: false },
  { label: "משתמשים", href: "/admin/users",       active: false },
  { label: "מחלוקות", href: "/admin/disputes",    active: false },
];

const PULSE = [
  { value: MOCK.recent7d.recentUsers7d,   label: "משתמשים חדשים"  },
  { value: MOCK.recent7d.recentListings7d, label: "מודעות חדשות"   },
  { value: MOCK.recent7d.recentBookings7d, label: "הזמנות חדשות"   },
];

type MetricRow = { label: string; value: number | string; total?: boolean; alert?: boolean };

const CARDS: { title: string; href: string; rows: MetricRow[] }[] = [
  {
    title: "משתמשים",
    href: "/admin/users",
    rows: [
      { label: 'סה"כ',             value: MOCK.users.totalUsers,       total: true  },
      { label: "אימות אושר",        value: MOCK.users.approvedKycUsers               },
      { label: "ממתינים לאישור",    value: MOCK.users.pendingKycUsers                },
      { label: "מושעים",            value: MOCK.users.suspendedUsers                 },
    ],
  },
  {
    title: "מודעות",
    href: "/admin/listings",
    rows: [
      { label: 'סה"כ',             value: MOCK.listings.totalListings,          total: true },
      { label: "פעילות",            value: MOCK.listings.activeListings                       },
      { label: "ממתינות לאישור",   value: MOCK.listings.pendingApprovalListings               },
      { label: "נדחו",              value: MOCK.listings.rejectedListings                     },
      { label: "מושהה",             value: MOCK.listings.pausedListings                       },
    ],
  },
  {
    title: "הזמנות",
    href: "/admin/bookings",
    rows: [
      { label: 'סה"כ',    value: MOCK.bookings.totalBookings,     total: true },
      { label: "ממתינות", value: MOCK.bookings.requestedBookings               },
      { label: "אושרו",   value: MOCK.bookings.confirmedBookings               },
      { label: "פעילות",  value: MOCK.bookings.activeBookings                  },
      { label: "הושלמו",  value: MOCK.bookings.completedBookings               },
      { label: "במחלוקת", value: MOCK.bookings.disputeBookings                 },
    ],
  },
  {
    title: "מחלוקות",
    href: "/admin/disputes",
    rows: [
      { label: 'סה"כ',   value: MOCK.disputes.totalDisputes,   total: true                                       },
      { label: "פתוחות", value: MOCK.disputes.openDisputes,    alert: MOCK.disputes.openDisputes > 0             },
      { label: "הוחלט",  value: MOCK.disputes.resolvedDisputes                                                    },
    ],
  },
];

export default function AdminMetricsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-[1420px] mx-auto px-5 pt-8 space-y-6">

        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <h1 className="font-sans text-[32px] font-black text-black">לוח בקרה</h1>

          <nav className="flex gap-2 flex-wrap">
            {NAV.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.active
                    ? "rounded-full border border-black px-4 py-1.5 font-assistant text-[13px] font-semibold bg-black text-white"
                    : "rounded-full border border-black/15 px-4 py-1.5 font-assistant text-[13px] font-semibold text-black hover:bg-black/5 transition-colors duration-200"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 7-day pulse strip */}
        <div>
          <p className="font-assistant text-[12px] text-[#AAAAAA] mb-3 uppercase tracking-wide">
            7 ימים אחרונים
          </p>
          <div className="grid grid-cols-3 gap-4">
            {PULSE.map(cell => (
              <div key={cell.label} className="rounded-[8px] border border-black/10 bg-white p-5">
                <p className="font-sans text-[36px] font-black text-black leading-none">
                  {cell.value}
                </p>
                <p className="font-assistant text-[13px] text-[#888888] mt-1">
                  {cell.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2×2 metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARDS.map(card => (
            <div key={card.title} className="rounded-[8px] border border-black/10 bg-white p-5">
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-[16px] font-black text-black">{card.title}</p>
                <Link
                  href={card.href}
                  className="font-assistant text-[12px] text-[#1A8C6A] hover:underline cursor-pointer"
                >
                  לניהול ←
                </Link>
              </div>

              {/* Metric rows */}
              <div>
                {card.rows.map((row, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-black/[0.06] last:border-0"
                  >
                    <span className="font-assistant text-[13px] text-[#888888]">
                      {row.label}
                    </span>
                    <span
                      className={
                        row.total
                          ? "font-sans text-[20px] font-black text-black"
                          : "font-sans text-[14px] font-black text-black"
                      }
                    >
                      {row.alert ? (
                        <span className="flex items-center gap-1.5">
                          {row.value}
                          <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                        </span>
                      ) : (
                        row.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  );
}
