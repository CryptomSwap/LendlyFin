import Link from "next/link";
import { OWNER_CTA } from "@/lib/copy/help-reassurance";

type RedesignOwnerCTAProps = {
  publishHref: string;
  isSignedIn: boolean;
};

export default function RedesignOwnerCTA({ publishHref, isSignedIn }: RedesignOwnerCTAProps) {
  return (
    <section className="mx-auto w-full max-w-[1420px] px-5 py-6">
      <div
        dir="rtl"
        className="relative flex min-h-[160px] flex-col items-start justify-between gap-6 overflow-hidden rounded-[12px] border border-white/60 px-8 py-10 md:flex-row md:items-center md:px-10 md:py-14"
        style={{
          background:
            "linear-gradient(135deg, #d4f5ec 0%, #a8e6d4 30%, #c5e8f0 60%, #e8d5f5 100%)",
        }}
      >
        <div className="flex max-w-lg flex-col gap-1.5">
          <p className="font-sans text-[13px] font-bold uppercase tracking-wide text-[#1A8C6A] italic">
            {OWNER_CTA.title}
          </p>
          <p className="max-w-sm font-assistant text-[14px] leading-relaxed text-black/60">
            {OWNER_CTA.subtitle}
          </p>
        </div>

        <Link
          href={publishHref}
          className="shrink-0 rounded-full border border-black/20 bg-white/70 px-6 py-2.5 font-sans text-[14px] font-bold text-black backdrop-blur-sm transition-colors duration-200 hover:bg-white"
        >
          {isSignedIn ? OWNER_CTA.ctaLabel : OWNER_CTA.ctaLabelSignedOut} ↑
        </Link>
      </div>
    </section>
  );
}
