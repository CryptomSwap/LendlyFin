"use client";

import { useEffect, useRef, useState } from "react";

const ENTRANCE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const TILES = [
  {
    stat: "100%",
    title: "מאומתים",
    description: "כל משכיר עובר אימות זהות לפני שמוצג בפלטפורמה",
    bg: "#C5CC7B",
    lightText: false,
  },
  {
    stat: "₪0",
    title: "הפתעות",
    description: "הפיקדון מוחזר בהתאם למצב הפריט — שקוף ומוגן לשני הצדדים",
    bg: "#1A8C6A",
    lightText: true,
  },
  {
    stat: "+500",
    title: "פריטים בקהילה",
    description: "ביקורות, הודעות ותמיכה — כלים ברורים להשכרה בין אנשים",
    bg: "#2C2C2C",
    lightText: true,
  },
] as const;

export default function TrustStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
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
      className="mx-auto w-full max-w-[1420px] px-5 py-6"
      aria-label="למה לסמוך על לנדלי"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {TILES.map((tile, index) => (
          <div
            key={tile.title}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 500ms ${ENTRANCE_EASE}, transform 500ms ${ENTRANCE_EASE}`,
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <article
              className="flex min-h-[160px] cursor-default flex-col justify-between rounded-[8px] p-6 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: tile.bg }}
            >
              <div>
                <p
                  className={`font-sans text-[42px] font-black leading-none ${
                    tile.lightText ? "text-white" : "text-black"
                  }`}
                >
                  {tile.stat}
                </p>
                <p
                  className={`mt-1 font-sans text-[15px] font-bold ${
                    tile.lightText ? "text-white/80" : "text-black/80"
                  }`}
                >
                  {tile.title}
                </p>
              </div>
              <p
                className={`mt-3 font-assistant text-[12px] leading-relaxed ${
                  tile.lightText ? "text-white/60" : "text-black/55"
                }`}
              >
                {tile.description}
              </p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
