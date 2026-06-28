"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export type TestimonialSlide = {
  lines: readonly [string, string];
  name: string;
  avatar: string;
  rating: number;
};

const SLIDE_DURATION_MS = 3000;
const TRANSITION_MS = 520;
export const TESTIMONIAL_SLIDE_STAGGER_MS = SLIDE_DURATION_MS / 2;

function TestimonialContent({
  lines,
  name,
  avatar,
  rating,
}: TestimonialSlide) {
  const starColor = rating > 4.0 ? "#1A8C6A" : "#C5CC7B";

  return (
    <div className="flex h-full min-h-[120px] flex-col">
      <div className="space-y-1 text-right">
        {lines.map((line) => (
          <p
            key={line}
            className="font-sans text-[18px] font-bold leading-[1.35] text-black"
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2.5">
        <div className="text-right">
          <p className="font-assistant text-[13px] font-semibold text-black">
            {name}
          </p>
          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="relative top-[2px] inline-flex h-[14px] items-center font-sans text-[13px] font-bold leading-none text-black">
              {rating.toFixed(1)}
            </span>
            <span className="inline-flex h-[14px] shrink-0 items-center justify-center">
              <Star
                className="h-[13px] w-[13px]"
                style={{ fill: starColor, color: starColor }}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                aria-hidden
              />
            </span>
          </div>
        </div>
        <Image
          src={avatar}
          alt={name}
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full border-2 border-[#F0F0F0] object-cover"
        />
      </div>
    </div>
  );
}

export default function TestimonialSlideshowCard({
  testimonials,
  startDelayMs = 0,
  className = "",
}: {
  testimonials: readonly TestimonialSlide[];
  /** Offsets the first slide change and progress animation (ms). */
  startDelayMs?: number;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [outgoingIndex, setOutgoingIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState(0);
  const [progressCycle, setProgressCycle] = useState(0);
  const [loopGeneration, setLoopGeneration] = useState(0);
  const isAnimatingRef = useRef(false);
  const activeIndexRef = useRef(0);

  const slideCount = testimonials.length;
  const hasMultipleSlides = slideCount > 1;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const advanceSlide = useCallback(() => {
    if (!hasMultipleSlides || isAnimatingRef.current) return;

    const currentIndex = activeIndexRef.current;
    const nextIndex = (currentIndex + 1) % slideCount;
    const isLoopRestart =
      nextIndex === 0 && currentIndex === slideCount - 1;

    isAnimatingRef.current = true;
    setOutgoingIndex(currentIndex);
    setIncomingIndex(nextIndex);
    setIsAnimating(true);

    window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsAnimating(false);
      isAnimatingRef.current = false;
      setProgressCycle((cycle) => cycle + 1);
      if (isLoopRestart) {
        setLoopGeneration((generation) => generation + 1);
      }
    }, TRANSITION_MS);
  }, [hasMultipleSlides, slideCount]);

  const isInitialDelayedStart =
    loopGeneration === 0 &&
    progressCycle === 0 &&
    activeIndex === 0 &&
    startDelayMs > 0;
  const slideIntervalMs = isInitialDelayedStart
    ? startDelayMs + SLIDE_DURATION_MS
    : SLIDE_DURATION_MS;

  useEffect(() => {
    if (!hasMultipleSlides) return;

    const timer = window.setTimeout(advanceSlide, slideIntervalMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, advanceSlide, hasMultipleSlides, progressCycle, slideIntervalMs]);

  const displayedIndex = isAnimating ? outgoingIndex : activeIndex;

  return (
    <article
      className={`relative min-h-[160px] min-w-0 flex-[2] overflow-hidden rounded-[8px] border border-black/15 bg-white p-5 pl-7 transition-[box-shadow,transform] duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] ${className}`}
      aria-live="polite"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-2 z-0 font-sans text-[56px] font-black leading-none text-[#E8F5F0]"
      >
        &ldquo;
      </span>

      {hasMultipleSlides && (
        <div
          key={`indicators-${loopGeneration}`}
          className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2"
          aria-hidden
        >
          {testimonials.map((_, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <div
                key={index}
                className="relative h-10 w-[3px] overflow-hidden rounded-full bg-black/10"
              >
                {isPast && (
                  <span className="absolute inset-0 rounded-full bg-[#1A8C6A]" />
                )}
                {isActive && (
                  <span
                    key={`progress-${loopGeneration}-${activeIndex}-${progressCycle}`}
                    className={`testimonial-slide-progress absolute inset-x-0 top-0 h-full rounded-full bg-[#1A8C6A] ${
                      isAnimating ? "testimonial-slide-progress--paused" : ""
                    }`}
                    style={{
                      animationDuration: `${SLIDE_DURATION_MS}ms`,
                      animationDelay: isInitialDelayedStart
                        ? `${startDelayMs}ms`
                        : undefined,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="relative z-[1] overflow-hidden">
        {!isAnimating && (
          <TestimonialContent {...testimonials[displayedIndex]} />
        )}

        {isAnimating && (
          <div className="testimonial-slide-stage relative min-h-[120px]">
            <div className="testimonial-slide-panel testimonial-slide-panel--exit absolute inset-0">
              <TestimonialContent {...testimonials[outgoingIndex]} />
            </div>
            <div className="testimonial-slide-panel testimonial-slide-panel--enter absolute inset-0">
              <TestimonialContent {...testimonials[incomingIndex]} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
