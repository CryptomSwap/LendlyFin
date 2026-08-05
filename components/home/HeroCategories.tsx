"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/constants";
import type { CategoryListingCount } from "@/lib/listings";

const CATEGORY_ICONS: Record<string, string> = {
  events: "celebration",
  camera: "photo_camera",
  tools: "home_repair_service",
  dj: "queue_music",
  camping: "forest",
  sports: "sports_soccer",
  music: "music_note",
};

const GAP = 36;
const CARD_WIDTH = 320;
const CARD_HEIGHT = 58;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.14;
const VISIBLE = 5;
const PEEK_1 = 14;
const PEEK_2 = 8;
const PAD_Y = 28;
const PAD_RIGHT = 12;
const FRICTION = 0.9;
const MAX_VEL = 42;
const CURVE_OFFSET_DESKTOP = 48;
const CURVE_OFFSET_MOBILE = 32;
const CURVE_PAD_LEFT_DESKTOP = 64;
const CURVE_PAD_LEFT_MOBILE = 48;
const SPRING_TENSION = 90;
const SPRING_FRICTION = 18;
const APPLE_EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

type HeroCategoriesProps = {
  counts?: CategoryListingCount[];
};

export function HeroCategories({ counts = [] }: HeroCategoriesProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPos = useRef(0);
  const scrollVel = useRef(0);
  const snapTarget = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const lastFrame = useRef(0);
  const hoveredIndex = useRef<number | null>(null);
  const maxScrollRef = useRef(0);
  const introOpacity = useRef(0);
  const cardsRef = useRef<HTMLElement[]>([]);
  const wheelHostRef = useRef<HTMLElement | null>(null);

  const categories = useMemo(() => {
    const countBySlug = new Map(counts.map((c) => [c.slug, c.count]));
    return CATEGORY_LIST.map((c) => ({
      slug: c.slug,
      name: c.labelHe,
      icon: CATEGORY_ICONS[c.slug] ?? "category",
      count: countBySlug.get(c.slug) ?? 0,
      href: `/search?category=${encodeURIComponent(c.slug)}`,
    }));
  }, [counts]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const outer = outerRef.current;
    let cards: HTMLElement[] = [];
    let ch = CARD_HEIGHT;
    let containerH = 0;
    let containerCenterY = 0;
    let maxScroll = 0;
    let scalePadX = 0;
    let scalePadY = 0;

    const getCurveOffset = () =>
      window.matchMedia("(min-width: 768px)").matches
        ? CURVE_OFFSET_DESKTOP
        : CURVE_OFFSET_MOBILE;

    const getCurvePadLeft = () =>
      window.matchMedia("(min-width: 768px)").matches
        ? CURVE_PAD_LEFT_DESKTOP
        : CURVE_PAD_LEFT_MOBILE;

    const centerWeightForY = (cardCenterY: number) => {
      const halfWindow = Math.max(containerH / 2, 1);
      const t = Math.min(1, Math.abs(cardCenterY - containerCenterY) / halfWindow);
      return Math.pow(Math.cos((t * Math.PI) / 2), 1.05);
    };

    const cardScale = (cardCenterY: number) => {
      const centerWeight = centerWeightForY(cardCenterY);
      const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * centerWeight;
      return { centerWeight, scale };
    };

    const applyLayout = () => {
      const totalH = containerH + PAD_Y * 2 + scalePadY * 2;
      el.style.height = `${containerH}px`;
      el.style.marginTop = `${PAD_Y + scalePadY}px`;
      el.style.marginBottom = `${PAD_Y + scalePadY}px`;
      if (outer) {
        outer.style.paddingLeft = `${getCurvePadLeft() + scalePadX}px`;
        outer.style.paddingRight = `${PAD_RIGHT}px`;
        outer.style.height = `${totalH}px`;
        outer.style.maxHeight = `${totalH}px`;
      }
    };

    const curveX = (cardCenterY: number) => {
      const halfWindow = Math.max(containerH / 2, 1);
      const dist = (cardCenterY - containerCenterY) / halfWindow;
      const t = Math.max(-1, Math.min(1, dist));
      const curveStrength = getCurveOffset();
      const bow = 1 - t * t;
      return Math.round(-curveStrength * bow);
    };

    const opacityForCard = (naturalTop: number, isDeck: boolean, centerWeight: number) => {
      if (naturalTop < -ch) return 0;
      if (naturalTop > containerH + ch * 0.25) return 0;
      const depthOpacity = 0.38 + centerWeight * 0.62;
      if (isDeck) return 0.75 * depthOpacity;
      if (naturalTop < 16) return (0.88 + (naturalTop / 16) * 0.12) * depthOpacity;
      return depthOpacity;
    };

    const render = (isAnimating: boolean) => {
      const s = scrollPos.current;
      const stride = ch + GAP;
      const motionTransition = isAnimating
        ? "none"
        : `top 0.5s ${APPLE_EASE}, transform 0.5s ${APPLE_EASE}, opacity 0.5s ${APPLE_EASE}, box-shadow 0.5s ${APPLE_EASE}, border-color 0.5s ${APPLE_EASE}`;

      const lastFull = Math.min(
        Math.floor((s + containerH - PEEK_1 - PEEK_2 - 4) / stride),
        cards.length - 1
      );

      cards.forEach((card, i) => {
        const naturalTop = i * stride - s;
        const isHovered = hoveredIndex.current === i;
        let top = naturalTop;
        let zIndex = 3;
        let isDeck = false;

        if (i === lastFull + 1) {
          top = lastFull * stride - s + ch - PEEK_1;
          zIndex = 2;
          isDeck = true;
        } else if (i === lastFull + 2) {
          top = lastFull * stride - s + ch - PEEK_1 - PEEK_2 + 4;
          zIndex = 1;
          isDeck = true;
        }

        const slotCenterY = top + ch / 2;
        const { centerWeight, scale } = cardScale(slotCenterY);
        const deckScale = isDeck ? Math.min(scale, 0.86) : scale;
        const rawScale = isHovered ? deckScale * 1.04 : deckScale;
        const finalScale = isAnimating
          ? Math.round(rawScale * 1000) / 1000
          : Math.round(rawScale * 100) / 100;
        const topAdjusted = Math.round(top - (ch * finalScale - ch) / 2);
        const cardCenterY = topAdjusted + (ch * finalScale) / 2;
        const xOffset = curveX(cardCenterY);
        const opacity = opacityForCard(top, isDeck, centerWeight) * introOpacity.current;
        const isFocused =
          !isDeck && Math.abs(slotCenterY - containerCenterY) < stride * 0.35;
        const depthZ = Math.round(centerWeight * 10);
        const shadowY = 8 + centerWeight * 18;
        const shadowBlur = 20 + centerWeight * 34;
        const shadowAlpha = 0.04 + centerWeight * 0.12;
        const glowRing =
          centerWeight > 0.45
            ? `, 0 0 0 2px rgba(26,140,106,${(centerWeight - 0.45) * 0.35})`
            : "";

        card.style.position = "absolute";
        card.style.top = `${topAdjusted}px`;
        card.style.right = "0";
        card.style.left = "auto";
        card.style.width = `${CARD_WIDTH}px`;
        card.style.height = `${ch}px`;
        card.style.transform = `translate3d(${xOffset}px, 0, 0) scale(${finalScale})`;
        card.style.transformOrigin = "100% 50%";
        card.style.zIndex = String(isHovered ? 12 : isDeck ? zIndex : Math.max(3, depthZ + 2));
        card.style.opacity = String(opacity);
        card.style.transition = motionTransition;
        card.style.willChange = isAnimating ? "transform, top, opacity" : "auto";
        card.style.pointerEvents = opacity < 0.05 ? "none" : "auto";
        card.style.boxShadow = isHovered
          ? `0 14px 40px rgba(0,0,0,0.14)${glowRing}`
          : `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha})${glowRing}`;
        card.style.borderColor = isHovered
          ? "rgba(0,0,0,0.1)"
          : isFocused
            ? `rgba(26,140,106,${0.1 + centerWeight * 0.2})`
            : "transparent";
        card.style.borderStyle = "solid";
        card.style.borderWidth = "1px";
      });
    };

    const nearestSnap = (pos: number) => {
      const stride = ch + GAP;
      const floatIndex = (pos + containerCenterY - ch / 2) / stride;
      const targetIndex = Math.round(floatIndex);
      const targetScroll = targetIndex * stride + ch / 2 - containerCenterY;
      return Math.max(0, Math.min(maxScroll, targetScroll));
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - lastFrame.current) / 1000;
      lastFrame.current = now;

      let isAnimating = false;

      if (snapTarget.current !== null) {
        const target = snapTarget.current;
        const displacement = scrollPos.current - target;
        const springForce = -SPRING_TENSION * displacement;
        const dampForce = -SPRING_FRICTION * scrollVel.current;
        const accel = springForce + dampForce;
        scrollVel.current += accel * dt;
        scrollPos.current += scrollVel.current * dt;

        if (Math.abs(displacement) < 0.25 && Math.abs(scrollVel.current) < 0.25) {
          scrollPos.current = target;
          scrollVel.current = 0;
          snapTarget.current = null;
        } else {
          isAnimating = true;
        }
      } else if (Math.abs(scrollVel.current) > 0.2) {
        scrollPos.current = Math.max(
          0,
          Math.min(maxScroll, scrollPos.current + scrollVel.current * dt * 60)
        );
        scrollVel.current *= FRICTION;
        isAnimating = true;

        if (Math.abs(scrollVel.current) <= 0.2) {
          scrollVel.current = 0;
          snapTarget.current = nearestSnap(scrollPos.current);
          isAnimating = true;
        }
      }

      render(isAnimating);

      const shouldContinue =
        isAnimating || snapTarget.current !== null || Math.abs(scrollVel.current) > 0.05;

      if (shouldContinue) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = null;
        render(false);
      }
    };

    const ensureTick = () => {
      if (raf.current === null) {
        lastFrame.current = performance.now();
        raf.current = requestAnimationFrame(tick);
      }
    };

    const setup = () => {
      cards = Array.from(el.querySelectorAll<HTMLElement>("[data-cat-item]"));
      cardsRef.current = cards;
      if (!cards.length) return;

      const measured = cards[0].getBoundingClientRect().height;
      ch = measured > 0 ? measured : CARD_HEIGHT;
      containerH = VISIBLE * ch + (VISIBLE - 1) * GAP + PEEK_1 + PEEK_2;
      maxScroll = Math.max(0, cards.length * (ch + GAP) - GAP - containerH);
      containerCenterY = containerH / 2;
      scalePadX = Math.ceil(CARD_WIDTH * (MAX_SCALE - 1) + 32);
      scalePadY = Math.ceil(ch * (MAX_SCALE - 1) + 16);
      maxScrollRef.current = maxScroll;

      scrollPos.current = Math.max(
        0,
        Math.min(maxScroll, 2 * (ch + GAP) + ch / 2 - containerCenterY)
      );

      applyLayout();
      render(false);
    };

    const onWheel = (e: WheelEvent) => {
      const max = maxScrollRef.current;
      const atTop = scrollPos.current <= 0 && e.deltaY < 0;
      const atBottom = scrollPos.current >= max && e.deltaY > 0;
      if (atTop || atBottom) return;
      e.preventDefault();
      snapTarget.current = null;
      scrollVel.current = Math.max(
        -MAX_VEL,
        Math.min(MAX_VEL, scrollVel.current + e.deltaY * 0.14)
      );
      ensureTick();
    };

    const onEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const i = cards.indexOf(target);
      if (i < 0) return;
      hoveredIndex.current = i;
      render(snapTarget.current !== null || Math.abs(scrollVel.current) > 0.2);
    };

    const onLeave = () => {
      hoveredIndex.current = null;
      render(snapTarget.current !== null || Math.abs(scrollVel.current) > 0.2);
    };

    const onResize = () => {
      setup();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        introOpacity.current = 1;
        render(false);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    const introFallback = window.setTimeout(() => {
      if (introOpacity.current < 1) {
        introOpacity.current = 1;
        render(false);
      }
    }, 400);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setup();

        cards.forEach((card) => {
          card.addEventListener("mouseenter", onEnter);
          card.addEventListener("mouseleave", onLeave);
        });

        const wheelHost = outer ?? el;
        wheelHostRef.current = wheelHost;
        wheelHost.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("resize", onResize);
      });
    });

    return () => {
      window.clearTimeout(introFallback);
      observer.disconnect();
      cardsRef.current.forEach((card) => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
      wheelHostRef.current?.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [categories]);

  return (
    <div
      ref={outerRef}
      className="relative mx-auto w-full max-w-[560px] shrink-0 overflow-visible md:mx-0 md:w-[540px] md:max-w-[540px]"
      style={{ scrollbarWidth: "none" }}
    >
      <div
        ref={containerRef}
        className="relative w-full overflow-visible"
        style={{ scrollbarWidth: "none" }}
        aria-label="קטגוריות להשכרה"
        role="list"
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            data-cat-item
            role="listitem"
            aria-label={`${cat.name}, ${cat.count} פריטים`}
            className="box-border flex shrink-0 cursor-pointer items-center gap-3.5 rounded-[10px] border border-transparent bg-white px-6 py-2.5 opacity-0 antialiased no-underline"
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            dir="rtl"
          >
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#F0FAF6]">
              <span className="hero-material-icon text-[21px] leading-none text-[#1A8C6A]" aria-hidden>
                {cat.icon}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-end">
              <span className="font-sans text-[17px] font-bold leading-tight text-black">{cat.name}</span>
              <span className="font-assistant text-[13px] leading-tight text-[#AAAAAA]">
                {cat.count} פריטים
              </span>
            </div>
            <span className="hero-material-icon mr-auto shrink-0 text-[18px] leading-none text-[#CCCCCC]" aria-hidden>
              chevron_left
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
