/**
 * Tom-safe FAQ and reassurance copy.
 * No unsupported guarantees (e.g. no specific return timelines, no optional insurance unless product has it).
 * Use for in-context help blocks; full FAQ at /help/faq may have broader content.
 */

export type FAQItem = { question: string; answer: string };

/** Payment: Bit, ref, manual confirmation */
export const PAYMENT_FAQ_ITEMS: FAQItem[] = [
  {
    question: "איך משלמים?",
    answer:
      "משלמים ב-Bit. חשוב לציין את מספר ההזמנה (LND-XXXXXX) בתשלום. אחרי התשלום הצוות מאמת ומאשר — תקבל עדכון כשההזמנה אושרה.",
  },
  {
    question: "מה קורה אחרי התשלום?",
    answer:
      "הצוות בודק את התשלום ומאשר את ההזמנה. אחרי האישור תראו הוראות איסוף ותוכלו לתאם עם המלווה. האישור לא אוטומטי — לוקח רגע.",
  },
  {
    question: "מתי מחזירים את הפיקדון?",
    answer:
      "אחרי החזרת הפריט המלווה מאשר את המצב. אם הכל תקין — הפיקדון משוחרר אליכם. במחלוקת צוות התמיכה בודק ומחליט.",
  },
];

/** Deposit and disputes (listing/booking context) */
export const DEPOSIT_DISPUTE_FAQ_ITEMS: FAQItem[] = [
  {
    question: "מתי מחזירים פיקדון?",
    answer:
      "אחרי החזרה המלווה מאשר את מצב הפריט. אם הכל תקין — הפיקדון משוחרר אליכם. במחלוקת צוות התמיכה בודק ומחליט.",
  },
  {
    question: "מה קורה במחלוקת?",
    answer:
      "מחלוקות (נזק, חסר) נפתחות בפלטפורמה. צוות התמיכה בודק את שני הצדדים ומחליט — פיקדון, פיצול או החזרה. תקבלו הודעה על ההחלטה.",
  },
];

/** Verification / KYC (profile context) */
export const VERIFICATION_REASSURANCE = {
  short:
    "אימות זהות נדרש להזמנות ומעניק אמון. מלווים מאומתים מסומנים במודעות.",
  learnMoreHref: "/help/safety",
  learnMoreLabel: "על אימות ובטיחות",
} as const;

/** Homepage: single line + links */
export const HOME_HELP_LINKS = {
  line: "שאלות על תשלום, פיקדון או בטיחות?",
  helpHref: "/help",
  helpLabel: "מרכז העזרה",
  faqHref: "/help/faq",
  faqLabel: "שאלות נפוצות",
} as const;

/** Homepage: short trust one-liner for hero area */
export const HOME_TRUST_ONELINER = "מאומתים · פיקדון מגן · קהילה עם ביקורות ותמיכה" as const;

/** Homepage FAQ: trust, deposit, pickup/return, damage (3–5 items) */
export const HOME_FAQ_ITEMS: FAQItem[] = [
  {
    question: "איך עובדת ההשכרה?",
    answer:
      "מחפשים ציוד, בוחרים תאריכים ומשלמים ב-Bit. אחרי אימות תקבלו הוראות איסוף. באיסוף מצלמים את מצב הפריט, ובהחזרה אותו דבר — הפיקדון מוחזר בהתאם למצב.",
  },
  {
    question: "מתי מחזירים את הפיקדון?",
    answer:
      "אחרי החזרת הפריט המלווה מאשר את המצב. אם הכל תקין — הפיקדון משוחרר אליכם. במחלוקת (נזק או חסר) צוות התמיכה בודק ומחליט.",
  },
  {
    question: "מי מאומת בפלטפורמה?",
    answer:
      "מלווים עוברים אימות זהות (KYC). בכל מודעה תראו אם המלווה מאומת. אימות נדרש גם להזמנות — כך שני הצדדים מוגנים.",
  },
  {
    question: "מה קורה אם יש נזק או פריט חסר?",
    answer:
      "בהחזרה מציינים נזק או חסר ומעלים תמונות. נפתחת מחלוקת וצוות התמיכה בודק את שני הצדדים ומחליט — פיקדון, פיצול או החזרה. תקבלו הודעה על ההחלטה.",
  },
];

/** Homepage: owner/lender CTA section */
export const OWNER_CTA = {
  title: "משכירים ציוד?",
  subtitle: "העלו מודעה, הגדירו מחיר ותאריכים — ומצאו שוכרים. פשוט ובטוח.",
  ctaLabel: "העלו מודעה",
  ctaLabelSignedOut: "התחברו להעלאה",
  signInHref: "/signin",
  addHref: "/add",
} as const;

/** Booking detail: short CTA */
export const BOOKING_HELP_CTA = {
  line: "צריך עזרה עם ההזמנה?",
  href: "/help/faq",
  label: "שאלות נפוצות",
} as const;

/** Homepage: testimonials section — conversational, specific, human */
export const HOME_TESTIMONIALS = [
  {
    quote: "הייתי צריך מקדחה ליום אחד לתיקון בבית. דני ענה מהר, האיסוף היה פשוט — והחזרתי באותו ערב. בדיוק מה שרציתי.",
    name: "דני ל.",
    city: "תל אביב",
    initial: "ד",
  },
  {
    quote: "השכרתי את המצלמה שלי לחתונה. המלווה היה ממש נחמד, הסביר איך להפעיל, והכל חזר חלק. ממליצה.",
    name: "מיה ר.",
    city: "חיפה",
    initial: "מ",
  },
  {
    quote: "חיפשנו אוהל לטיול ברגע האחרון. מישהו מהשכונה — תאמנו באיסוף בערב, הכל זרם. חוסך קנייה לפעם בשנה.",
    name: "יוסי כ.",
    city: "ירושלים",
    initial: "י",
  },
  {
    quote: "תומר היה ממש זמין וענה מהר כשרציתי ציוד בדקה התשעים. הגענו להסכמה על המקום והשעה — פשוט ונעים.",
    name: "רונית ש.",
    city: "רמת גן",
    initial: "ר",
  },
  {
    quote: "השכרתי מצלמת וידאו לפרויקט. הבעלים הסביר הכל, האיסוף היה ליד הבית. חוזר להשתמש.",
    name: "אלעד מ.",
    city: "באר שבע",
    initial: "א",
  },
] as const;

/** Homepage: why Lendly section — title and short supporting line */
export const HOME_WHY_LENDLY_HEADING = {
  title: "למה להשתמש בלנדלי",
  subtitle: "יתרונות ברורים — השכרה בטוחה, פשוטה וקרובה אליכם.",
} as const;

/** Homepage: why Lendly — 6 editorial features (Secure deposits, Verified community, etc.) */
export const HOME_WHY_LENDLY = [
  {
    title: "פיקדון מגן",
    description: "פיקדון מוחזר בהתאם למצב — שקוף ומגן על שני הצדדים.",
  },
  {
    title: "קהילה מאומתת",
    description: "מלווים עוברים אימות. רואים בכל מודעה מי מאומת.",
  },
  {
    title: "חוסכים כסף",
    description: "שוכרים רק כשצריך, בלי לרכוש ציוד יקר.",
  },
  {
    title: "ציוד מקומי",
    description: "מכירים שכנים ומלווים באזור — השכרה קרובה ונוחה.",
  },
  {
    title: "גמיש בתאריכים",
    description: "בוחרים תאריכים שמתאימים — מחפשים ומזמינים בקלות.",
  },
  {
    title: "שיתוף בר-קיימא",
    description: "שימוש חוזר במקום קנייה — פחות בזבוז ויותר קיימות.",
  },
] as const;
