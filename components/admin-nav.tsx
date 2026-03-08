import Link from "next/link";

const LINKS = [
  { href: "/admin/metrics", label: "מדדים" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/listings", label: "מודעות" },
  { href: "/admin/bookings", label: "הזמנות" },
  { href: "/admin/disputes", label: "מחלוקות" },
  { href: "/admin/kyc", label: "אימות זהות" },
] as const;

export function AdminNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2" dir="rtl">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-sm text-primary hover:underline"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
