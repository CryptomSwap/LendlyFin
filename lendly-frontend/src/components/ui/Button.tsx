import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const VARIANT_CLASSES = {
  primary:
    "rounded-full bg-[#1A8C6A] text-white font-sans font-bold shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(26,140,106,0.45)] transition-all duration-300",
  secondary:
    "rounded-full border border-black/15 bg-white text-black font-sans font-bold hover:bg-black/5 transition-colors duration-200",
  ghost:
    "rounded-full text-[#1A8C6A] font-sans font-bold hover:bg-[#1A8C6A]/8 transition-colors duration-200",
  danger:
    "rounded-full bg-red-500 text-white font-sans font-bold hover:bg-red-600 transition-colors duration-200",
} as const;

const SIZE_CLASSES = {
  sm: "px-4 py-1.5 text-[13px]",
  md: "px-6 py-2.5 text-[14px]",
  lg: "px-10 py-4 text-[17px]",
} as const;

export default function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className = "",
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    disabled ? "pointer-events-none opacity-50" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ className?: string }>,
      {
        ...props,
        className: [classes, children.props.className].filter(Boolean).join(" "),
        ...(disabled ? { "aria-disabled": true } : {}),
      }
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
