import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Explicit width preset for desktop layouts */
  width?: "narrow" | "default" | "wide";
  /** Use wider max-width (90rem) for content-heavy pages */
  wide?: boolean;
  /** Omit horizontal padding (e.g. when child has its own) */
  noPadding?: boolean;
}

const PADDING = "px-4 md:px-8";
const MAX_WIDTH_NARROW = "max-w-md md:max-w-4xl";
const MAX_WIDTH_DEFAULT = "max-w-md md:max-w-7xl";
const MAX_WIDTH_WIDE = "max-w-md md:max-w-7xl lg:max-w-[90rem]";

/** Single shared inner geometry for search page: hero and results use this so they align exactly. */
export const SEARCH_PAGE_INNER_CLASS =
  "w-full max-w-md md:max-w-7xl lg:max-w-[90rem] mx-auto px-4 md:px-8";

export function PageContainer({
  children,
  className,
  width,
  wide = false,
  noPadding = false,
}: PageContainerProps) {
  const preset =
    width === "narrow"
      ? MAX_WIDTH_NARROW
      : width === "wide" || wide
        ? MAX_WIDTH_WIDE
        : MAX_WIDTH_DEFAULT;

  return (
    <div
      className={cn(
        "w-full mx-auto",
        preset,
        !noPadding && PADDING,
        className
      )}
    >
      {children}
    </div>
  );
}
