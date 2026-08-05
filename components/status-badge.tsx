import { BookingStatus } from "@prisma/client";
import { STATUS_UI } from "@/lib/booking-status-ui";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const ui = STATUS_UI[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${ui.color}`}
    >
      {ui.label}
    </span>
  );
}
