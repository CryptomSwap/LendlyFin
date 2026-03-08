"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  /** "md" = default; "lg" = hero / prominent (larger tap target, rounded-xl) */
  size?: "md" | "lg";
  /** When true, input has no border (for use inside a wrapped action block) */
  embedded?: boolean;
  /** When true, input has translucent background for use on hero/image */
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

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary/50",
          !translucent && "bg-card text-foreground placeholder:text-muted-foreground",
          translucent && "bg-white/40 text-foreground placeholder:text-foreground/70 border border-white/25 backdrop-blur-md",
          !embedded && !translucent && "border border-input",
          size === "lg" && "rounded-xl px-4 py-3.5 text-base",
          size === "lg" && !embedded && !translucent && "shadow-soft"
        )}
      />
    </form>
  );
}
