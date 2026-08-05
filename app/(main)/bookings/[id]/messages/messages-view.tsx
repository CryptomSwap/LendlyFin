"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
};

const PRIMARY_BTN =
  "rounded-full bg-[#1A8C6A] font-sans font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:bg-[#167A5C] hover:-translate-y-[2px] transition-all duration-300 w-full sm:w-auto sm:self-end";

export function BookingMessagesView({
  bookingId,
  initialMessages,
  currentUserId,
}: {
  bookingId: string;
  initialMessages: Message[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const text = body.trim();
    if (!text || !currentUserId) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "שגיאה בשליחת הודעה");
        return;
      }
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setBody("");
      router.refresh();
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 min-h-[200px] max-h-[50vh] overflow-y-auto flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-[#1A8C6A]/40 mb-3" aria-hidden />
            <p className="font-sans font-bold text-black">אין הודעות עדיין</p>
            <p className="font-assistant text-[14px] text-[#888888] mt-0.5 max-w-sm">
              שלחו הודעה כדי להתחיל שיחה עם המלווה או השוכר לגבי ההזמנה.
            </p>
          </div>
        ) : (
          <ul className="space-y-4 list-none p-0 m-0" aria-label="הודעות">
            {messages.map((m) => {
              const isMe = m.senderId === currentUserId;
              return (
                <li
                  key={m.id}
                  className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="font-assistant text-xs font-medium text-[#888888]">
                    {m.senderName}
                    {isMe ? " (אני)" : ""}
                  </span>
                  <div
                    className={`rounded-[8px] px-3 py-2.5 font-assistant text-[14px] max-w-[85%] ${
                      isMe
                        ? "bg-[#1A8C6A] text-white"
                        : "bg-black/5 text-black border border-black/10"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                  <span className="font-assistant text-xs text-[#888888]">
                    {new Date(m.createdAt).toLocaleString("he-IL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {messages.length > 0 && (
        <p className="font-assistant text-[12px] text-[#888888] text-center">
          הודעות שמורות להקשר ההזמנה. לתמיכה נוספת צור קשר.
        </p>
      )}

      {!currentUserId ? (
        <p className="font-assistant text-[14px] text-[#888888]">יש להתחבר כדי לשלוח הודעות.</p>
      ) : (
        <>
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="form-group flex-1 min-w-0">
              <Label htmlFor="booking-message-body" className="sr-only">תוכן הודעה</Label>
              <textarea
                id="booking-message-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="כתוב הודעה..."
                className="input-base w-full min-h-[80px] resize-y"
                dir="rtl"
                disabled={sending}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || !body.trim()}
              className={PRIMARY_BTN}
            >
              {sending ? "שולח..." : "שלח"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
