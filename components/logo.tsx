"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Lendly logo from MVP (public/logo.png, fallback public/logo.svg). */
const LOGO_PNG = "/logo.png";
const LOGO_SVG_FALLBACK = "/logo.svg";
const LOGO_ALT = "Lendly";

export interface LogoProps {
  /** Height in pixels; default 32. Width auto to preserve aspect. */
  size?: number;
  /** Show wordmark "Lendly" next to the icon. */
  showWordmark?: boolean;
  /** Wrap in link to /home. */
  linkToHome?: boolean;
  className?: string;
}

export default function Logo({
  size = 32,
  showWordmark = false,
  linkToHome = false,
  className,
}: LogoProps) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_PNG}
        alt=""
        className={cn("shrink-0 h-auto", showWordmark && "rounded-lg")}
        style={{ height: size, width: "auto" }}
        aria-hidden
        onError={(e) => {
          const el = e.currentTarget;
          if (el.src.endsWith(".png")) el.src = LOGO_SVG_FALLBACK;
        }}
      />
      {showWordmark && (
        <span className="font-semibold text-foreground">{LOGO_ALT}</span>
      )}
    </>
  );

  const wrapperClassName = cn(
    "inline-flex items-center gap-2",
    className
  );

  if (linkToHome) {
    return (
      <Link
        href="/home"
        className={cn(wrapperClassName, "transition-opacity hover:opacity-90 active:opacity-95")}
        aria-label={`${LOGO_ALT} – דף הבית`}
      >
        {content}
      </Link>
    );
  }

  return <span className={wrapperClassName}>{content}</span>;
}
