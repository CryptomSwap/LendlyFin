"use client";

import { useEffect, useState } from "react";

type SecurityEvent = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  reason: string | null;
  targetDisplayName: string | null;
  createdAt: string;
};

const FILTERS = [
  { id: "all", label: "הכל", value: "" },
  { id: "rl", label: "Rate Limit", value: "RATE_LIMIT_DENIED" },
  { id: "view-admin", label: "KYC View (Admin)", value: "KYC_FILE_VIEWED_ADMIN" },
  { id: "view-self", label: "KYC View (Self)", value: "KYC_FILE_VIEWED_SELF" },
  { id: "deny", label: "KYC Access Denied", value: "KYC_FILE_ACCESS_DENIED" },
] as const;

export default function AdminSecurityEvents() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState("");

  const fetchEvents = async (action: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = action
        ? `/api/admin/security-events?action=${encodeURIComponent(action)}`
        : "/api/admin/security-events";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch security events");
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(activeAction);
  }, [activeAction]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));

  if (loading) {
    return <p className="text-sm text-[#888888]">טוען אירועי אבטחה...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveAction(f.value)}
            className={`brand-chip ${
              activeAction === f.value ? "brand-chip-active" : "brand-chip-idle"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <div className="py-6 font-assistant text-[13px] text-[#888888]">
            אין אירועי אבטחה להצגה.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-[8px] border border-black/10 bg-white p-4">
              <div className="mb-2">
                <h2 className="font-sans text-[14px] font-black text-black">{event.action}</h2>
              </div>
              <div className="space-y-1 font-assistant text-[12px] text-[#888888]">
                <p>זמן: {formatDate(event.createdAt)}</p>
                <p>שחקן: {event.actor}</p>
                <p>סוג ישות: {event.entityType}</p>
                <p>מזהה ישות: {event.entityId}</p>
                {event.targetDisplayName ? <p>יעד: {event.targetDisplayName}</p> : null}
                {event.reason ? <p>פירוט: {event.reason}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
