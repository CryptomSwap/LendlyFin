"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  size?: "md" | "lg";
  embedded?: boolean;
  translucent?: boolean;
}

export default function SearchInput({
  defaultValue = "",
  placeholder = "מה מחפשים?",
  className = "",
  size = "md",
  embedded = false,
  translucent = false,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/search");
    }
  };

  const inputClasses = [
    "w-full font-assistant outline-none transition-all duration-200",
    "focus:border-[#1A8C6A] focus:ring-2 focus:ring-[#1A8C6A]/20",
    size === "lg"
      ? "rounded-[10px] py-3.5 text-[15px]"
      : "rounded-[8px] py-3 text-[14px]",
    translucent
      ? "border border-white/25 bg-white/40 text-black backdrop-blur-md placeholder:text-black/60"
      : "border border-black/15 bg-white px-4 text-black placeholder:text-[#AAAAAA]",
    !translucent && "px-4",
    embedded && !translucent ? "border-transparent bg-transparent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
      />
    </form>
  );
}
