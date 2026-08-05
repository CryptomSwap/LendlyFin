"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
  const [logoSrc, setLogoSrc] = useState(LOGO_PNG);

  const content = (
    <>
      <Image
        src={logoSrc}
        alt=""
        className={cn("shrink-0 h-auto", showWordmark && "rounded-lg")}
        width={size}
        height={size}
        style={{ height: size, width: "auto" }}
        unoptimized
        aria-hidden
        onError={() => {
          if (logoSrc === LOGO_PNG) {
            setLogoSrc(LOGO_SVG_FALLBACK);
          }
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
