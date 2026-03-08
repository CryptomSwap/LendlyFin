"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  callbackUrl: string;
};

const LOG_PREFIX = "[SignInGoogle]";

export default function SignInGoogleButton({ callbackUrl }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(LOG_PREFIX, "render", { callbackUrl });
  }, [callbackUrl]);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log("[SignInGoogle] click");
    setLoading(true);
    const absoluteUrl =
      typeof window !== "undefined" && callbackUrl.startsWith("/")
        ? window.location.origin + callbackUrl
        : callbackUrl;
    console.log(LOG_PREFIX, "callbackUrl", { callbackUrl, absoluteUrl });
    try {
      console.log(LOG_PREFIX, "calling signIn('google', { callbackUrl, redirect: true })");
      const result = await signIn("google", { callbackUrl: absoluteUrl, redirect: true });
      console.log(LOG_PREFIX, "signIn result", result);
    } catch (err) {
      console.error(LOG_PREFIX, "caught error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "gradient", size: "default" }), "w-full")}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "מעביר..." : "המשך עם Google"}
    </button>
  );
}
