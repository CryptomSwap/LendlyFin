"use client";

import { useState, useEffect, useRef } from "react";

const ROTATE_INTERVAL_MS = 20_000;
const CROSSFADE_DURATION_MS = 1800;

/** All hero images; rotation cycles through these in order (0 → 1 → 2 → 3 → 0 …). */
const EXPERIENCE_BASES = [
  "party",
  "gardning",
  "experience-camping",
  "experience-diy",
];

/** Try .png first, then .jpg, .jpeg, then no extension */
const EXTENSIONS = [".png", ".jpg", ".jpeg", ""];

function getImageSrc(baseName: string, extensionIndex: number): string {
  return `/hero/${baseName}${EXTENSIONS[extensionIndex]}`;
}

function preloadImage(baseName: string, extensionIndex: number = 0) {
  const src = getImageSrc(baseName, extensionIndex);
  const img = new Image();
  img.src = src;
}

function WallpaperLayer({
  baseName,
  extensionIndex,
  onError,
  visible,
  transitionMs,
}: {
  baseName: string;
  extensionIndex: number;
  onError: () => void;
  visible: boolean;
  transitionMs: number;
}) {
  const src = getImageSrc(baseName, extensionIndex);
  const hasMoreExtensions = extensionIndex < EXTENSIONS.length - 1;

  return (
    <div
      className="absolute inset-0 ease-in-out"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${transitionMs}ms`,
      }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover object-right"
        onError={hasMoreExtensions ? onError : undefined}
      />
    </div>
  );
}

const N = EXPERIENCE_BASES.length;

export function HeroExperienceBackground() {
  // The index of the image we're currently showing. Cycles 0 → 1 → 2 → 3 → 0 …
  const [displayIndex, setDisplayIndex] = useState(0);
  // 'idle' = showing layer 0 (current). 'transitioning' = crossfading to layer 1 (next).
  const [phase, setPhase] = useState<"idle" | "transitioning">("idle");
  const [fallbackExt, setFallbackExt] = useState<Record<number, number>>({});

  const rotateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossfadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    EXPERIENCE_BASES.forEach((base) => preloadImage(base, 0));
  }, []);

  useEffect(() => {
    function scheduleNextRotation() {
      rotateTimeoutRef.current = setTimeout(() => {
        rotateTimeoutRef.current = null;
        setPhase("transitioning");

        crossfadeTimeoutRef.current = setTimeout(() => {
          crossfadeTimeoutRef.current = null;
          setDisplayIndex((prev) => (prev + 1) % N);
          setPhase("idle");
          scheduleNextRotation();
        }, CROSSFADE_DURATION_MS);
      }, ROTATE_INTERVAL_MS);
    }

    scheduleNextRotation();

    return () => {
      if (rotateTimeoutRef.current) clearTimeout(rotateTimeoutRef.current);
      if (crossfadeTimeoutRef.current) clearTimeout(crossfadeTimeoutRef.current);
    };
  }, []);

  const indexA = displayIndex;
  const indexB = (displayIndex + 1) % N;
  const showA = phase === "idle";
  const showB = phase === "transitioning";

  const handleError = (slot: 0 | 1, index: number) => {
    setFallbackExt((prev) => {
      const current = prev[index] ?? 0;
      if (current >= EXTENSIONS.length - 1) return prev;
      return { ...prev, [index]: current + 1 };
    });
  };

  const transitionMs =
    phase === "transitioning" ? CROSSFADE_DURATION_MS : 0;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* Image fills full hero area; rounded bottom corners */}
      <div className="absolute inset-0 overflow-hidden rounded-b-2xl">
        <WallpaperLayer
          baseName={EXPERIENCE_BASES[indexA]}
          extensionIndex={fallbackExt[indexA] ?? 0}
          onError={() => handleError(0, indexA)}
          visible={showA}
          transitionMs={transitionMs}
        />
        <WallpaperLayer
          baseName={EXPERIENCE_BASES[indexB]}
          extensionIndex={fallbackExt[indexB] ?? 0}
          onError={() => handleError(1, indexB)}
          visible={showB}
          transitionMs={transitionMs}
        />
      </div>
    </div>
  );
}
