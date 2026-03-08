"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SuspendActions({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"suspend" | "unsuspend" | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSuspend() {
    setLoading("suspend");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "שגיאה בהשעיה" });
        return;
      }
      setMessage({ type: "ok", text: "המשתמש הושעה" });
      setReason("");
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "שגיאת רשת" });
    } finally {
      setLoading(null);
    }
  }

  async function handleUnsuspend() {
    setLoading("unsuspend");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "שגיאה בביטול השעיה" });
        return;
      }
      setMessage({ type: "ok", text: "ביטול השעיה בוצע" });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "שגיאת רשת" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3" dir="rtl">
      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>
          {message.text}
        </p>
      )}
      {suspended ? (
        <Button
          variant="outline"
          onClick={handleUnsuspend}
          disabled={!!loading}
        >
          {loading === "unsuspend" ? "מבטל..." : "בטל השעיה"}
        </Button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="סיבת השעיה (אופציונלי)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full max-w-xs"
          />
          <Button
            variant="destructive"
            onClick={handleSuspend}
            disabled={!!loading}
          >
            {loading === "suspend" ? "משעה..." : "השעה משתמש"}
          </Button>
        </div>
      )}
    </div>
  );
}
