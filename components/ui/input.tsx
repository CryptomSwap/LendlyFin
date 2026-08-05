import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground selection:bg-[#1A8C6A] selection:text-white dark:bg-input/30 h-10 w-full min-w-0 rounded-[8px] border border-black/15 bg-white px-4 py-2.5 text-sm font-assistant text-black placeholder:text-[#AAAAAA] shadow-none transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-[#1A8C6A] focus:ring-2 focus:ring-[#1A8C6A]/20",
        "aria-invalid:border-red-400 aria-invalid:ring-red-400/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
