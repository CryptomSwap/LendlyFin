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
export const HOME_TRUST_ONELINER = "*כל משכיר מאומת, כל שוכר שם פיקדון - הקהילה מעל הכל ❤️" as const;

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
    quote:
      "הייתי חייב מקדחה לסופ\"ש לתיקון אחד שקבעתי עם אשתי מזמן... יואל ענה מהר, האיסוף היה פשוט והחזרתי ביום ראשון. הציל אותי! הכל היה פשוט ויעיל",
    name: "דניאל ש.",
    city: "תל אביב",
    initial: "ד",
  },
  {
    quote:
      "השכרתי את המצלמה שלי לחתונות במקום שהיא תשכב בבית. היא כבר הרוויחה יותר מהסכום שקניתי אותה",
    name: "מיה ר.",
    city: "חיפה",
    initial: "מ",
  },
  {
    quote:
      "חיפשנו אוהל, ולא רצינו לקנות עוד אחד שישכב בארון. מישהו מהשכונה לידנו העלה מודעה, תאמנו באותה שעה והכל זרם. חסך לנו מלא כסף לטיול של פעם בשנה",
    name: "יוסי כ.",
    city: "ירושלים",
    initial: "י",
  },
  {
    quote:
      "ציוד מעולה ותקשורת אש!! כל פעם שאצטרך גנרטור במקומות בארץ אחפש בלנדלי",
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
  title: "למה לנדלי?",
  subtitle: "",
} as const;

/** Homepage: why Lendly — 6 editorial features (Secure deposits, Verified community, etc.) */
export const HOME_WHY_LENDLY = [
  {
    title: "פיקדון מגן",
    description: "בכל השכרה יש פיקדון מוסכם על המלווה והמשכיר, בטיחותי ושקוף.",
  },
  {
    title: "קהילה מאומתת",
    description: "כל משכיר עובר אימות, הקהילה מעל הכל!",
  },
  {
    title: "חוסכים כסף",
    description: "שוכרים במקום לקנות, או מרוויחים על החפצים שיש בבית",
  },
  {
    title: "שיתוף מקומי",
    description: "עוזרים לקהילה או נהנים מהשכרה קרובה ונוחה",
  },
  {
    title: "תאריכים גמישים",
    description: "בוחרים תאריכים מראש ומחפשים בקלות",
  },
  {
    title: "עולם ירוק",
    description: "משתמשים במה שיש בסביבה שלך, ומצילים את הכדור מקנייה מבוזבזת",
  },
] as const;
