"use client";

import { useEffect, useRef } from "react";

const CATEGORIES = [
  { name: "צילום וידאו", icon: "photo_camera", count: 240 },
  { name: "כלי עבודה", icon: "home_repair_service", count: 185 },
  { name: "קמפינג וטיולים", icon: "forest", count: 120 },
  { name: "אירועים", icon: "celebration", count: 310 },
  { name: "ציוד ספורט", icon: "sports_soccer", count: 95 },
  { name: "ציוד מוזיקה", icon: "music_note", count: 78 },
  { name: "ציוד DJ", icon: "queue_music", count: 54 },
  { name: "אופניים וקורקינטים", icon: "directions_bike", count: 66 },
];

const GAP = 12;
const VISIBLE = 5;
const PEEK_1 = 22;
const PEEK_2 = 12;
const FRICTION = 0.88;
const MAX_VEL = 80;

export function HeroCategories() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const vel = useRef(0);
  const raf = useRef<number | null>(null);
  const cardH = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-cat-item]"));
    cardH.current = cards[0]?.offsetHeight ?? 64;
    const ch = cardH.current;
    const containerH = VISIBLE * ch + (VISIBLE - 1) * GAP + PEEK_1 + PEEK_2;
    const maxScroll = Math.max(0, cards.length * (ch + GAP) - GAP - containerH);

    el.style.height = `${containerH}px`;

    const opacityForCard = (naturalTop: number, isDeck: boolean) => {
      if (naturalTop < -8) return 0;
      if (isDeck) return 0.8;
      if (naturalTop < 32) return 0.8 + (naturalTop / 32) * 0.2;
      return 1;
    };

    const render = () => {
      const s = scrollY.current;
      const stride = ch + GAP;

      // top mask
      el.style.maskImage = s > 4
        ? "linear-gradient(to bottom, transparent 0px, black 56px, black 100%)"
        : "none";
      (el.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = el.style.maskImage;

      // which card index is the last fully visible one?
      const lastFull = Math.min(
        Math.floor((s + containerH - PEEK_1 - PEEK_2 - 4) / stride),
        cards.length - 1
      );

      cards.forEach((card, i) => {
        const naturalTop = i * stride - s;

        if (i === lastFull + 1) {
          // first deck card — peeks PEEK_1 px below lastFull
          const anchor = lastFull * stride - s + ch - PEEK_1;
          card.style.cssText = `
            position: absolute;
            top: ${anchor}px;
            left: 0; right: 0;
            transform: scale(0.95);
            transform-origin: top center;
            z-index: 2;
            opacity: ${opacityForCard(anchor, true)};
          `;
        } else if (i === lastFull + 2) {
          // second deck card — peeks PEEK_2 px below first deck card
          const anchor = lastFull * stride - s + ch - PEEK_1 - PEEK_2 + 4;
          card.style.cssText = `
            position: absolute;
            top: ${anchor}px;
            left: 0; right: 0;
            transform: scale(0.90);
            transform-origin: top center;
            z-index: 1;
            opacity: ${opacityForCard(anchor, true)};
          `;
        } else {
          card.style.cssText = `
            position: absolute;
            top: ${naturalTop}px;
            left: 0; right: 0;
            transform: scale(1);
            z-index: 3;
            opacity: ${opacityForCard(naturalTop, false)};
          `;
        }
      });
    };

    // entrance animation — fade in stagger
    cards.forEach((c) => { c.style.opacity = "0"; });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = "opacity 0.5s cubic-bezier(0.16,1,0.3,1)";
            c.style.opacity = "1";
            setTimeout(() => { c.style.transition = ""; }, 600);
          }, i * 80);
        });
        render();
      }));
    }, { threshold: 0.1 });
    observer.observe(el);

    render();

    const tick = () => {
      if (Math.abs(vel.current) < 0.3) {
        vel.current = 0;
        raf.current = null;
        render();
        return;
      }
      scrollY.current = Math.max(0, Math.min(maxScroll, scrollY.current + vel.current));
      vel.current *= FRICTION;
      render();
      raf.current = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const atTop = scrollY.current <= 0 && e.deltaY < 0;
      const atBottom = scrollY.current >= maxScroll && e.deltaY > 0;
      if (atTop || atBottom) return;
      e.preventDefault();
      vel.current = Math.max(-MAX_VEL, Math.min(MAX_VEL, vel.current + e.deltaY * 0.25));
      if (raf.current === null) raf.current = requestAnimationFrame(tick);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[30%] shrink-0 self-center overflow-hidden pr-[60px] pl-4"
      style={{ scrollbarWidth: "none" }}
    >
      {CATEGORIES.map((cat) => (
        <div
          key={cat.name}
          data-cat-item
          className="flex shrink-0 cursor-pointer items-center gap-3 rounded-[8px] border border-transparent bg-white px-4 py-3 hover:border-black/15 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
          dir="rtl"
        >
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#F0FAF6]">
            <span className="hero-material-icon text-[20px] leading-none text-[#1A8C6A]" aria-hidden>
              {cat.icon}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-end">
            <span className="font-sans text-[14px] font-bold text-black">{cat.name}</span>
            <span className="font-assistant text-[11px] text-[#AAAAAA]">{cat.count} פריטים</span>
          </div>
          <span className="hero-material-icon mr-auto text-[16px] leading-none text-[#CCCCCC]" aria-hidden>
            chevron_left
          </span>
        </div>
      ))}
    </div>
  );
}
