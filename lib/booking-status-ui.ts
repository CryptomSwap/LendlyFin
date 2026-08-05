import { BookingStatus } from "@prisma/client";

export const STATUS_UI: Record<
  BookingStatus,
  {
    label: string;
    color: string; // tailwind classes
    nextHint: string;
  }
> = {
  REQUESTED: {
    label: "בקשה נשלחה",
    color: "bg-yellow-100 text-yellow-800",
    nextHint: "ממתינים לאישור מהמשכיר.",
  },
  CONFIRMED: {
    label: "אושר",
    color: "bg-blue-100 text-blue-800",
    nextHint: "יש לבצע איסוף כדי להתחיל את ההשכרה.",
  },
  ACTIVE: {
    label: "פעיל",
    color: "bg-green-100 text-green-800",
    nextHint: "ההשכרה מתנהלת כעת.",
  },
  RETURNED: {
    label: "הוחזר",
    color: "bg-cyan-100 text-cyan-800",
    nextHint: "חלון מחלוקת קצר עדיין פתוח.",
  },
  IN_DISPUTE: {
    label: "במחלוקת",
    color: "bg-orange-100 text-orange-800",
    nextHint: "הצוות בודק את המקרה.",
  },
  NON_RETURN_PENDING: {
    label: "אי-החזרה בבדיקה",
    color: "bg-rose-100 text-rose-800",
    nextHint: "האירוע הוסלם לבדיקת צוות.",
  },
  NON_RETURN_CONFIRMED: {
    label: "אי-החזרה אושרה",
    color: "bg-red-100 text-red-800",
    nextHint: "האירוע סווג כאי-החזרה.",
  },
  COMPLETED: {
    label: "הושלם",
    color: "bg-gray-200 text-gray-800",
    nextHint: "ההזמנה הסתיימה בהצלחה.",
  },
  CANCELLED: {
    label: "בוטלה",
    color: "bg-gray-200 text-gray-500",
    nextHint: "ההזמנה בוטלה.",
  },
  DISPUTE: {
    label: "מחלוקת",
    color: "bg-orange-100 text-orange-800",
    nextHint: "נפתחה מחלוקת הדורשת טיפול.",
  },
};
