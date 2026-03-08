"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEV_IMPERSONATION_ALLOWED_IDS,
  DEV_IMPERSONATION_LABELS,
} from "@/lib/auth/dev-impersonation";

type Status = {
  impersonationAvailable: boolean;
  currentUser: { id: string; name: string | null } | null;
};

export default function DevImpersonationSwitcher() {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dev/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  if (!status?.impersonationAvailable) return null;

  const currentId = status.currentUser?.id ?? "";
  const allowedSet = new Set(DEV_IMPERSONATION_ALLOWED_IDS);
  const options = [
    { id: "", label: "ברירת מחדל (env)" },
    ...DEV_IMPERSONATION_ALLOWED_IDS.map((id) => ({
      id,
      label: DEV_IMPERSONATION_LABELS[id] ?? id,
    })),
  ];
  const selectValue = allowedSet.has(currentId as typeof DEV_IMPERSONATION_ALLOWED_IDS[number])
    ? currentId
    : "";

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setLoading(true);
    try {
      const res = await fetch("/api/dev/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: value === "" ? null : value }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2" title="Dev: switch user (DEV_AUTH_BYPASS)">
      <Link
        href="/dev/qa"
        className="text-xs text-primary hover:underline whitespace-nowrap"
        title="מרכז QA"
      >
        QA
      </Link>
      <label htmlFor="dev-impersonate" className="text-xs text-muted-foreground whitespace-nowrap">
        כניסה כ:
      </label>
      <select
        id="dev-impersonate"
        value={selectValue}
        onChange={handleChange}
        disabled={loading}
        className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground min-w-[7rem] disabled:opacity-50"
        dir="rtl"
      >
        {options.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
