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

  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef(phase);
  const lastTransitionStartRef = useRef(0);

  phaseRef.current = phase;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const timeSinceLastStart = now - lastTransitionStartRef.current;
      // Only start if idle; and if we've already run once, require a full interval since last start
      if (phaseRef.current !== "idle") return;
      if (lastTransitionStartRef.current > 0 && timeSinceLastStart < ROTATE_INTERVAL_MS) return;

      lastTransitionStartRef.current = now;
      setPhase("transitioning");

      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = setTimeout(() => {
        setDisplayIndex((prev) => (prev + 1) % N);
        // Switch back to layer 0 after React has applied the new displayIndex (next frame)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhase("idle");
            completionTimeoutRef.current = null;
          });
        });
      }, CROSSFADE_DURATION_MS);
    }, ROTATE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
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
          transitionMs={CROSSFADE_DURATION_MS}
        />
        <WallpaperLayer
          baseName={EXPERIENCE_BASES[indexB]}
          extensionIndex={fallbackExt[indexB] ?? 0}
          onError={() => handleError(1, indexB)}
          visible={showB}
          transitionMs={CROSSFADE_DURATION_MS}
        />
      </div>
    </div>
  );
}
