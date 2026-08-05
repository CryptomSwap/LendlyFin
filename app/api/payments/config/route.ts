import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/provider";

export const runtime = "nodejs";

/** Public: which payment UI to show (no secrets). */
export async function GET() {
  return NextResponse.json({
    provider: getPaymentProvider(),
  });
}
