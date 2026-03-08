"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResolveDisputeForm({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [resolution, setResolution] = useState<"owner" | "renter" | "split">("owner");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, adminNote: adminNote.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "שגיאה בסגירת המחלוקת");
        return;
      }
      router.refresh();
    } catch {
      setError("שגיאה בסגירת המחלוקת");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">סגור מחלוקת</CardTitle>
        <p className="text-sm text-muted-foreground">
          בחר החלטה והערה (אופציונלי). סגירה תעביר את ההזמנה להושלמה.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="form-group">
            <span className="form-label mb-2 block">החלטה</span>
            <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="החלטה">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="owner"
                  checked={resolution === "owner"}
                  onChange={() => setResolution("owner")}
                  className="rounded-full border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">לטובת בעלים</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="renter"
                  checked={resolution === "renter"}
                  onChange={() => setResolution("renter")}
                  className="rounded-full border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">לטובת שוכר</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="split"
                  checked={resolution === "split"}
                  onChange={() => setResolution("split")}
                  className="rounded-full border-border text-primary focus:ring-ring"
                />
                <span className="text-sm">פיצול</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <Label htmlFor="resolve-admin-note">הערה (אופציונלי)</Label>
            <Input
              id="resolve-admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="הערת סיום..."
              className="max-w-md w-full"
              disabled={submitting}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "שומר..." : "סגור מחלוקת והעבר להזמנה הושלמה"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
