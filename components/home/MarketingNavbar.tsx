"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, ArrowLeft } from "lucide-react";

const STATIC_TEXT = "אני רוצה להשכיר\u00A0 ";
const PHRASES = [
  "מצלמה מקצועית...",
  "אוהל ל-6 אנשים...",
  "סוללה למקיטה...",
  "כיסאות לאירוע...",
  "שמלת כלה...",
  "קורקינט חשמלי...",
  "גיטרה לערב...",
];

const SEARCH_CATEGORIES = ["צילום וידאו", "כלי עבודה", "קמפינג", "אירועים", "ספורט", "מוזיקה"];

function findNearestCategory(q: string): string {
  const scored = SEARCH_CATEGORIES.map((c) => ({
    cat: c,
    score: [...q].filter((ch) => ch !== " " && c.includes(ch)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.cat ?? SEARCH_CATEGORIES[0];
}

const TYPE_SPEED = 65;
const DELETE_SPEED = 40;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 400;
const INITIAL_DELAY = 600;

function useTypewriter() {
  const [displayedDynamic, setDisplayedDynamic] = useState("");
  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunning = useRef(false);

  const tick = useCallback(() => {
    if (!isRunning.current) return;

    const currentPhrase = PHRASES[phraseIndex.current];

    if (!isDeleting.current) {
      charIndex.current++;
      setDisplayedDynamic(currentPhrase.slice(0, charIndex.current));

      if (charIndex.current === currentPhrase.length) {
        isDeleting.current = true;
        timerRef.current = setTimeout(tick, PAUSE_AFTER_TYPE);
      } else {
        timerRef.current = setTimeout(tick, TYPE_SPEED);
      }
    } else {
      charIndex.current--;
      setDisplayedDynamic(currentPhrase.slice(0, charIndex.current));

      if (charIndex.current === 0) {
        isDeleting.current = false;
        phraseIndex.current = (phraseIndex.current + 1) % PHRASES.length;
        timerRef.current = setTimeout(tick, PAUSE_AFTER_DELETE);
      } else {
        timerRef.current = setTimeout(tick, DELETE_SPEED);
      }
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;
    tick();
  }, [tick]);

  const stop = useCallback(() => {
    isRunning.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(start, INITIAL_DELAY);
    return () => {
      clearTimeout(delay);
      stop();
    };
  }, [start, stop]);

  return { displayedDynamic, start, stop };
}

export default function Navbar() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const trimmedQuery = inputValue.trim();
  const directMatches = SEARCH_CATEGORIES.filter((c) => c.includes(trimmedQuery));
  const showSuggestion = isFocused && trimmedQuery.length >= 2 && directMatches.length < 3;
  const suggestedCat = directMatches[0] ?? findNearestCategory(trimmedQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { displayedDynamic, start, stop } = useTypewriter();

  const showPlaceholder = !isFocused && inputValue === "";

  const handleFocus = () => {
    setIsFocused(true);
    stop();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue === "") {
      start();
    }
  };

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setMenuOpen(true);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setMenuOpen(false), 200);
  };

  return (
    <nav
      dir="rtl"
      className="sticky top-4 z-50 mx-auto max-w-[700px]"
    >
      <div className="relative">
        <div
          className="relative z-10 flex items-center bg-white px-5 py-2"
          style={{
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: menuOpen ? "8px 8px 0 0" : "8px",
          }}
        >
          {/* RIGHT: Logo */}
          <Link
            href="/"
            className="shrink-0"
            style={{
              fontFamily: "var(--font-heebo)",
              fontWeight: 900,
              fontSize: "36px",
              color: "#1A8C6A",
            }}
          >
            לנדלי
          </Link>

          {/* Divider */}
          <div
            className="-my-2 mx-4 shrink-0 self-stretch"
            style={{
              width: "1px",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />

          {/* CENTER: Search */}
          <div
            className="relative flex flex-1 items-center gap-2.5"
            onClick={() => inputRef.current?.focus()}
          >
            <Search size={19} className="shrink-0 text-gray-400" />

            <div className="relative flex-1">
              {showPlaceholder && (
                <div
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-assistant)",
                    fontSize: "16px",
                  }}
                >
                  <span style={{ color: "#999" }}>{STATIC_TEXT}</span>
                  <span style={{ color: "#bbb" }}>{displayedDynamic}</span>
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="relative w-full bg-transparent outline-none"
                style={{
                  fontFamily: "var(--font-assistant)",
                  fontSize: "16px",
                  color: showPlaceholder ? "transparent" : undefined,
                }}
              />
            </div>
          </div>

          {/* LEFT: Avatar + Burger */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{
                width: "38px",
                height: "38px",
                border: "1px solid rgba(0,0,0,0.15)",
                backgroundColor: "#F7F6F3",
                fontFamily: "var(--font-heebo)",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              א
            </Link>

            <button
              className="flex items-center text-gray-400 transition-colors duration-200 hover:text-[#1A8C6A]"
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Suggestion row — shown when query has < 3 category matches */}
        {showSuggestion && !menuOpen && (
          <div
            className="absolute left-0 right-0 top-full z-10 flex items-center gap-3 px-5 py-2.5"
            style={{
              backgroundColor: "white",
              border: "1px solid rgba(0,0,0,0.12)",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <span
              style={{ fontFamily: "var(--font-assistant)", fontSize: "13px", color: "#666666" }}
            >
              לא מצאנו תוצאות — אולי התכוונת ל...?
            </span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                router.push(`/search?category=${encodeURIComponent(suggestedCat)}`);
              }}
              style={{ fontFamily: "var(--font-assistant)", fontSize: "12px" }}
              className="shrink-0 rounded-full bg-[#F0FAF6] px-3 py-1 font-semibold text-[#1A8C6A] transition-colors duration-150 hover:bg-[#1A8C6A] hover:text-white"
            >
              {suggestedCat}
            </button>
          </div>
        )}

        {/* Dropdown — absolute so opening it doesn't push page content down */}
        <div
          className="absolute left-0 right-0 top-full overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: menuOpen ? "500px" : "0px",
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? "auto" : "none",
            borderLeft: "1px solid rgba(0,0,0,0.15)",
            borderRight: "1px solid rgba(0,0,0,0.15)",
            borderBottom: menuOpen ? "1px solid rgba(0,0,0,0.15)" : "0px solid transparent",
            borderRadius: "0 0 8px 8px",
            backgroundColor: "white",
          }}
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }} />
          <div
            className="flex gap-5 px-5 py-5 backdrop-blur-md"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.18))",
              border: "1px solid rgba(255,255,255,0.38)",
            }}
          >
            {/* Right column: menu links */}
            <div
              className="flex flex-1 flex-col"
              style={{
                fontFamily: "var(--font-assistant)",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              <MenuLink href="/owner">פרסם פריט להשכרה</MenuLink>
              <MenuLink href="/owner">הפריטים שלי</MenuLink>
              <MenuLink href="/bookings">ההזמנות שלי</MenuLink>

              <div className="my-3" style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.1)" }} />

              <MenuLink href="/search">חיפוש מתקדם</MenuLink>
              <MenuLink href="/search">כל הקטגוריות</MenuLink>

              <div className="my-3" style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.1)" }} />

              <MenuLink href="/profile">הפרופיל שלי</MenuLink>
              <MenuLink href="/">איך לנדלי עובד?</MenuLink>
              <MenuLink href="/help">תמיכה</MenuLink>
              <MenuLink href="/signin">התנתק</MenuLink>
            </div>

            {/* Left column: promo block */}
            <div
              className="flex flex-1 flex-col justify-between rounded-lg p-4"
              style={{ backgroundColor: "#1A8C6A" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-heebo)",
                  fontWeight: 900,
                  fontSize: "18px",
                  color: "#fff",
                  lineHeight: 1.4,
                }}
              >
                מה שוכב לך בבית?
                <br />
                תתחיל להרוויח
              </p>
              <Link
                href="/owner"
                className="mt-4 flex items-center justify-center gap-1.5 self-start rounded bg-white px-4 py-2 transition-opacity duration-200 hover:opacity-90"
                style={{
                  fontFamily: "var(--font-heebo)",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#1A8C6A",
                }}
              >
                פרסם עכשיו
                <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-full py-1.5 text-right text-black transition-colors duration-200 hover:text-[#1A8C6A]"
    >
      {children}
    </Link>
  );
}
