/**
 * Date range overlap and availability helpers.
 * Used by booking create (overlap check) and blocked-ranges APIs.
 */

function toTime(d: Date | string): number {
  return (typeof d === "string" ? new Date(d) : d).getTime();
}

/** True if [startA, endA] overlaps [startB, endB] (inclusive). */
export function datesOverlap(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const a1 = toTime(startA);
  const a2 = toTime(endA);
  const b1 = toTime(startB);
  const b2 = toTime(endB);
  return a1 <= b2 && b1 <= a2;
}

/** Ensure start <= end and both are valid; return null if invalid. */
export function normalizeRange(
  start: Date | string,
  end: Date | string
): { startDate: Date; endDate: Date } | null {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  if (startDate > endDate) return { startDate: endDate, endDate: startDate };
  return { startDate, endDate };
}

/** True if the given date (day) falls within [rangeStart, rangeEnd] (inclusive day range). */
export function isDateInRange(
  date: Date,
  rangeStart: Date | string,
  rangeEnd: Date | string
): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const t = d.getTime();
  const start = typeof rangeStart === "string" ? new Date(rangeStart) : new Date(rangeStart);
  const end = typeof rangeEnd === "string" ? new Date(rangeEnd) : new Date(rangeEnd);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return t >= start.getTime() && t <= end.getTime();
}
