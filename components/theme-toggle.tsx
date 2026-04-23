"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { startTransition, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light" as const, label: "בהיר", Icon: Sun },
  { value: "dark" as const, label: "כהה", Icon: Moon },
  { value: "system" as const, label: "מערכת", Icon: Monitor },
];

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex rounded-lg border border-border bg-muted/40 p-1 min-h-[2.75rem]"
        aria-hidden
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="מראה"
      className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex flex-1 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
