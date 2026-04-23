"use client";

import { useCallback } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportBugButton() {
  const handleReportBug = useCallback(() => {
    if (typeof window === "undefined") return;

    const pageUrl = window.location.href;
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toISOString();

    void fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "QA Bug Report",
        description: [
          "Please describe what happened and how to reproduce it:",
          "",
          "1) Steps to reproduce:",
          "2) Expected result:",
          "3) Actual result:",
          "",
          "--- Debug context (auto-filled) ---",
          `Page URL: ${pageUrl}`,
          `Timestamp: ${timestamp}`,
          `User Agent: ${userAgent}`,
        ].join("\n"),
        pageUrl,
        userAgent,
      }),
    }).then(() => {
      window.alert("תודה! הדיווח נשמר במערכת התמיכה.");
    });
  }, []);

  return (
    <div className="fixed z-40 bottom-28 md:bottom-6 left-4 md:left-6">
      <Button
        type="button"
        variant="destructive"
        className="rounded-full shadow-lg px-4"
        onClick={handleReportBug}
        aria-label="Report a bug"
      >
        <Bug className="h-4 w-4" aria-hidden />
        Report bug
      </Button>
    </div>
  );
}
