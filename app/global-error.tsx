"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">אירעה שגיאה בלתי צפויה</h1>
          <p className="text-sm text-muted-foreground">
            אנחנו כבר בודקים את הבעיה. אפשר לרענן את הדף ולנסות שוב.
          </p>
        </main>
      </body>
    </html>
  );
}
