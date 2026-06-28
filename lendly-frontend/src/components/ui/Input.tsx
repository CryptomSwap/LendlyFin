import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const INPUT_CLASSES =
  "w-full rounded-[8px] border border-black/15 bg-white px-4 py-2.5 font-assistant text-[14px] text-black placeholder:text-[#AAAAAA] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#1A8C6A] focus:ring-2 focus:ring-[#1A8C6A]/20";

export default function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block font-sans text-[13px] font-bold text-black"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        className={[
          INPUT_CLASSES,
          error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1 font-assistant text-[12px] text-red-500"
        >
          {error}
        </p>
      ) : null}

      {!error && hint ? (
        <p
          id={`${inputId}-hint`}
          className="mt-1 font-assistant text-[12px] text-[#AAAAAA]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
