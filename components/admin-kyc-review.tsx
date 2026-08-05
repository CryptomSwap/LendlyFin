"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="py-8 text-center font-assistant text-[14px] text-[#888888]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-[#1A8C6A]"></div>
          <p className="mt-2 text-[#888888]">טוען...</p>
        </div>
      </div>
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
      <div className="flex gap-2 border-b border-black/10">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-sans font-bold ${
            activeTab === "pending"
              ? "border-b-2 border-[#1A8C6A] text-[#1A8C6A]"
              : "text-[#888888]"
          }`}
        >
          בקשות ממתינות ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 font-sans font-bold ${
            activeTab === "audit"
              ? "border-b-2 border-[#1A8C6A] text-[#1A8C6A]"
              : "text-[#888888]"
          }`}
        >
          היסטוריית אישורים ({auditLogs.length})
        </button>
      </div>

      {activeTab === "audit" && (
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#888888]">אין היסטוריית אישורים</p>
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="rounded-[8px] border border-black/10 bg-white p-4">
                <div className="font-assistant text-[13px] text-black">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-sans font-bold ${
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
                        <p className="text-xs text-[#888888] mt-1">
                          על ידי: {log.adminName}
                        </p>
                        {log.reason && (
                          <p className="text-xs text-[#888888] mt-1">
                            סיבה: {log.reason}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-[#888888]">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#888888]">אין בקשות אימות ממתינות</p>
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

          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2">
              <h2 className="font-sans text-[15px] font-black text-black">פרטי משתמש</h2>
            </div>
            <div className="space-y-2 font-assistant text-[13px] text-black">
              <div className="flex justify-between">
                <span className="text-[#888888]">שם:</span>
                <span>{selectedUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">תאריך שליחה:</span>
                <span>{formatDate(selectedUser.kycSubmittedAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[8px] border border-black/10 bg-white p-4">
              <div className="mb-2">
                <h2 className="font-sans text-[15px] font-black text-black">סלפי</h2>
              </div>
              <div>
                {selectedUser.kycSelfieUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-black/10 bg-black/[0.03]">
                    <Image
                      src={selectedUser.kycSelfieUrl}
                      alt="Selfie"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-[#888888]">לא זמין</p>
                )}
              </div>
            </div>

            <div className="rounded-[8px] border border-black/10 bg-white p-4">
              <div className="mb-2">
                <h2 className="font-sans text-[15px] font-black text-black">תעודת זהות</h2>
              </div>
              <div>
                {selectedUser.kycIdUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-black/10 bg-black/[0.03]">
                    <Image
                      src={selectedUser.kycIdUrl}
                      alt="ID"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-[#888888]">לא זמין</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2">
              <h2 className="font-sans text-[15px] font-black text-black">פעולות</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-sans text-[13px] font-bold text-black">
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
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-[8px] border border-black/10 bg-white p-4">
              <div className="font-assistant text-[13px] text-black">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-[#888888]">
                        נשלח: {formatDate(user.kycSubmittedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {user.kycSelfieUrl && (
                        <div className="relative w-16 h-16 rounded border border-black/10 overflow-hidden bg-black/[0.03]">
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
                        <div className="relative w-16 h-16 rounded border border-black/10 overflow-hidden bg-black/[0.03]">
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
              </div>
            </div>
          ))}
          </div>
          )}
        </>
      )}
    </div>
  );
}
