"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";

const ROTATE_INTERVAL_MS = 20_000;
const CROSSFADE_DURATION_MS = 1800;

/** All hero images; rotation cycles through these in order (0 → 1 → 2 → 3 → 0 …). */
const HERO_IMAGE_SOURCES = [
  ["/hero/party.png", "/hero/party.jpg"],
  ["/hero/gardning.png"],
  ["/hero/experience-camping.png"],
  ["/hero/experience-diy.png"],
];

function preloadImage(imageSources: string[], sourceIndex: number = 0) {
  const src = imageSources[sourceIndex];
  if (!src) return;
  const img = new Image();
  img.src = src;
}

function WallpaperLayer({
  imageSources,
  sourceIndex,
  onError,
  visible,
  transitionMs,
}: {
  imageSources: string[];
  sourceIndex: number;
  onError: () => void;
  visible: boolean;
  transitionMs: number;
}) {
  const src = imageSources[sourceIndex] ?? imageSources[0];
  const hasMoreSources = sourceIndex < imageSources.length - 1;

  return (
    <div
      className="absolute inset-0 ease-in-out"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${transitionMs}ms`,
      }}
    >
      <NextImage
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-right"
        unoptimized
        onError={hasMoreSources ? onError : undefined}
      />
    </div>
  );
}

const N = HERO_IMAGE_SOURCES.length;

export function HeroExperienceBackground() {
  // The index of the image we're currently showing. Cycles 0 → 1 → 2 → 3 → 0 …
  const [displayIndex, setDisplayIndex] = useState(0);
  // 'idle' = showing layer 0 (current). 'transitioning' = crossfading to layer 1 (next).
  const [phase, setPhase] = useState<"idle" | "transitioning">("idle");
  const [fallbackExt, setFallbackExt] = useState<Record<number, number>>({});

  const rotateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossfadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    HERO_IMAGE_SOURCES.forEach((sources) => preloadImage(sources, 0));
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
      const maxIndex = (HERO_IMAGE_SOURCES[index]?.length ?? 1) - 1;
      if (current >= maxIndex) return prev;
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
          imageSources={HERO_IMAGE_SOURCES[indexA]}
          sourceIndex={fallbackExt[indexA] ?? 0}
          onError={() => handleError(0, indexA)}
          visible={showA}
          transitionMs={transitionMs}
        />
        <WallpaperLayer
          imageSources={HERO_IMAGE_SOURCES[indexB]}
          sourceIndex={fallbackExt[indexB] ?? 0}
          onError={() => handleError(1, indexB)}
          visible={showB}
          transitionMs={transitionMs}
        />
      </div>
    </div>
  );
}
