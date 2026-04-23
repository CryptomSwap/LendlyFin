"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import Image from "next/image";

type KYCUser = {
  id: string;
  name: string;
  kycStatus: string;
  kycSelfieUrl: string | null;
  kycIdUrl: string | null;
  kycSubmittedAt: string | null;
  kycRejectedReason: string | null;
};

type AuditLog = {
  id: string;
  userId: string;
  targetUserId: string;
  action: string;
  reason: string | null;
  adminName: string;
  targetUserName: string;
  createdAt: string;
};

type Tab = "pending" | "audit";

export default function AdminKYCReview() {
  const [users, setUsers] = useState<KYCUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPendingKYC(), fetchAuditLogs()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      const res = await fetch("/api/admin/kyc");
      if (!res.ok) {
        throw new Error("Failed to fetch pending KYC");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/admin/kyc/audit");
      if (!res.ok) {
        throw new Error("Failed to fetch audit logs");
      }
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      // Don't throw - audit logs failure shouldn't block the UI
    }
  };

  const handleApprove = async (userId: string) => {
    if (!confirm("האם אתה בטוח שברצונך לאשר את אימות הזהות?")) {
      return;
    }

    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/kyc/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve KYC");
      }

      // Remove from list
      setUsers(users.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      // Refresh audit logs
      fetchAuditLogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectReason.trim() && !confirm("לאשר דחייה ללא סיבה?")) {
      return;
    }

    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/kyc/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectReason.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reject KYC");
      }

      // Remove from list
      setUsers(users.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setRejectReason("");
      }
      // Refresh audit logs
      fetchAuditLogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "לא זמין";
    return new Intl.DateTimeFormat("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-border border-t-primary"></div>
          <p className="mt-2 text-muted-foreground">טוען...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="error">{error}</Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium ${
            activeTab === "pending"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          בקשות ממתינות ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 font-medium ${
            activeTab === "audit"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          היסטוריית אישורים ({auditLogs.length})
        </button>
      </div>

      {activeTab === "audit" && (
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">אין היסטוריית אישורים</p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action === "APPROVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.action === "APPROVE" ? "✅ אושר" : "❌ נדחה"}
                          </span>
                          <span className="text-sm font-semibold">
                            {log.targetUserName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          על ידי: {log.adminName}
                        </p>
                        {log.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            סיבה: {log.reason}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">אין בקשות אימות ממתינות</p>
            </div>
          ) : selectedUser ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedUser(null);
              setRejectReason("");
            }}
          >
            ← חזור לרשימה
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>פרטי משתמש</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">שם:</span>
                <span>{selectedUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">תאריך שליחה:</span>
                <span>{formatDate(selectedUser.kycSubmittedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>סלפי</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUser.kycSelfieUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                    <Image
                      src={selectedUser.kycSelfieUrl}
                      alt="Selfie"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">לא זמין</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>תעודת זהות</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUser.kycIdUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                    <Image
                      src={selectedUser.kycIdUrl}
                      alt="ID"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">לא זמין</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>פעולות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  סיבת דחייה (אופציונלי):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-base w-full"
                  rows={3}
                  placeholder="הזן סיבת דחייה..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleApprove(selectedUser.id)}
                  disabled={processing === selectedUser.id}
                  className="flex-1"
                >
                  {processing === selectedUser.id ? "מאשר..." : "אשר"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedUser.id)}
                  disabled={processing === selectedUser.id}
                  className="flex-1"
                >
                  {processing === selectedUser.id ? "דוחה..." : "דחה"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        נשלח: {formatDate(user.kycSubmittedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {user.kycSelfieUrl && (
                        <div className="relative w-16 h-16 rounded border border-border overflow-hidden bg-muted">
                          <Image
                            src={user.kycSelfieUrl}
                            alt="Selfie"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      {user.kycIdUrl && (
                        <div className="relative w-16 h-16 rounded border border-border overflow-hidden bg-muted">
                          <Image
                            src={user.kycIdUrl}
                            alt="ID"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    צפה
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          )}
        </>
      )}
    </div>
  );
}
