import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Use wider max-width (90rem) for content-heavy pages */
  wide?: boolean;
  /** Omit horizontal padding (e.g. when child has its own) */
  noPadding?: boolean;
}

const PADDING = "px-4 md:px-8";
const MAX_WIDTH_DEFAULT = "max-w-md md:max-w-7xl";
const MAX_WIDTH_WIDE = "max-w-md md:max-w-7xl lg:max-w-[90rem]";

/** Single shared inner geometry for search page: hero and results use this so they align exactly. */
export const SEARCH_PAGE_INNER_CLASS =
  "w-full max-w-md md:max-w-7xl lg:max-w-[90rem] mx-auto px-4 md:px-8";

export function PageContainer({
  children,
  className,
  wide = false,
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        wide ? MAX_WIDTH_WIDE : MAX_WIDTH_DEFAULT,
        !noPadding && PADDING,
        className
      )}
    >
      {children}
    </div>
  );
}
