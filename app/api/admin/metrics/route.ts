import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { measurePerf } from "@/lib/perf";

export const runtime = "nodejs";

/** GET /api/admin/metrics – admin-only platform health metrics */
export async function GET() {
  return measurePerf("api.admin.metrics.GET", async () => {
    const { error } = await requireAdmin();
    if (error) return error;
    return NextResponse.json(await getAdminMetrics());
  });
}
