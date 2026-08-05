"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      className="w-full rounded-full border border-black/15 bg-white px-6 py-3 font-sans text-[15px] font-bold text-black transition-colors duration-200 hover:bg-black/5"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      התנתקות
    </button>
  );
}
