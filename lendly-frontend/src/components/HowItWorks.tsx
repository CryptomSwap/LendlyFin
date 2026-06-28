"use client";

import { useEffect, useRef, useState } from "react";
import ScrollRevealTitle from "@/components/ScrollRevealTitle";

const STEP_LABELS = ["שלב 1", "שלב 2", "שלב 3"] as const;

const CARDS = [
  {
    title: "מחפשים ציוד",
    items: [
      "מחפשים לפי קטגוריה, מחיר ומיקום",
      "בוחרים תאריכי השכרה",
      "שולחים בקשה למשכיר",
    ],
  },
  {
    title: "מתאמים ומשלמים",
    items: [
      "המשכיר מאשר את הבקשה",
      "משלמים בצורה מאובטחת",
      "קובעים איסוף או משלוח",
    ],
  },
  {
    title: "איסוף והחזרה",
    items: [
      "אוספים את הציוד מהמשכיר",
      "משתמשים ונהנים",
      "מחזירים בדיוק כמו שהגיע",
    ],
  },
] as const;

const STEP_DURATION_MS = 2200;
const STEP_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function getFillStyle(isActive: boolean) {
  return {
    transform: isActive ? "scaleX(1)" : "scaleX(0)",
    transition: isActive ? `transform ${STEP_DURATION_MS}ms linear` : "none",
    transformOrigin: "right center",
  } as const;
}

function StepPill({ label, isActive }: { label: string; isActive: boolean }) {
  const fillStyle = getFillStyle(isActive);

  return (
    <div className="relative cursor-default overflow-hidden rounded-full border border-black/15 bg-white px-5 py-1.5">
      <span className="absolute inset-0 bg-black" style={fillStyle} aria-hidden />

      <span
        className="relative z-10 font-sans text-[14px] font-bold text-white"
        style={{ mixBlendMode: "difference" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, STEP_DURATION_MS);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      dir="rtl"
      className="mx-auto w-full max-w-[1420px] px-5 py-24"
      aria-label="איך זה עובד"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="whitespace-nowrap font-assistant text-[56px] leading-[1.1] text-[#AAAAAA]">
          השכרת ציוד מעולם לא הייתה פשוטה יותר
        </p>

        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4">
        <ScrollRevealTitle className="font-sans text-[48px] font-black leading-none tracking-[-2px] text-black">
          איך זה עובד?
        </ScrollRevealTitle>

        <a
          href="#"
          className="font-sans text-[16px] font-bold text-[#1A8C6A] transition-opacity hover:opacity-80"
        >
          התחל להשכיר ←
        </a>
        </div>
      </div>

      <div className="relative mt-12 hidden px-[60px] md:block">
        <div className="grid grid-cols-3 gap-3">
          {STEP_LABELS.map((label, index) => (
            <div key={label} className="flex justify-center">
              <StepPill label={label} isActive={activeStep === index} />
            </div>
          ))}
        </div>

        <div className="relative mt-4 h-3">
          <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-black/10" />
          <div className="grid grid-cols-3 gap-3">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className="flex justify-center">
                <span
                  className={`relative z-10 h-3 w-3 rounded-full ${
                    activeStep === index
                      ? "bg-black"
                      : "border-2 border-black/20 bg-white"
                  }`}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
        {CARDS.map((card, index) => (
          <article
            key={card.title}
            className={`flex flex-col gap-4 rounded-[8px] border bg-white p-6 transition-all duration-300 ease-out ${
              cardsVisible && activeStep === index
                ? "border-black/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] -translate-y-1"
                : "border-black/10 shadow-none translate-y-0"
            }`}
            style={{
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? undefined : "translateY(20px)",
              transition: cardsVisible
                ? undefined
                : `opacity 600ms ${STEP_EASE}, transform 600ms ${STEP_EASE}`,
              transitionDelay: cardsVisible ? undefined : `${index * 120}ms`,
            }}
          >
            <h3 className="font-sans text-[18px] font-black leading-tight text-black">
              {card.title}
            </h3>

            <ul className="flex flex-col space-y-2">
              {card.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-right font-assistant text-[14px] leading-relaxed text-[#555555]"
                >
                  <span
                    className="shrink-0 font-sans text-[14px] font-bold text-[#1A8C6A]"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
