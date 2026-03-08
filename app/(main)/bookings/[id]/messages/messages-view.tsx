"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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

export function BookingMessagesView({
  bookingId,
  initialMessages,
  currentUserId,
  bookingRef = null,
}: {
  bookingId: string;
  initialMessages: Message[];
  currentUserId: string | null;
  bookingRef?: string | null;
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
      <Card className="shadow-soft">
        <CardContent className="py-4 min-h-[200px] max-h-[50vh] overflow-y-auto flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" aria-hidden />
              <p className="font-medium text-foreground">אין הודעות עדיין</p>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-sm">
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
                    <span className="text-xs font-medium text-muted-foreground">
                      {m.senderName}
                      {isMe ? " (אני)" : ""}
                    </span>
                    <div
                      className={`rounded-xl px-3 py-2.5 text-sm max-w-[85%] ${
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          הודעות שמורות להקשר ההזמנה. לתמיכה נוספת צור קשר.
        </p>
      )}

      {!currentUserId ? (
        <p className="text-sm text-muted-foreground">יש להתחבר כדי לשלוח הודעות.</p>
      ) : (
        <>
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex gap-2 items-end">
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
              className="self-end"
            >
              {sending ? "שולח..." : "שלח"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
