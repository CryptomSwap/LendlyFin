import Link from "next/link";

export default function OwnerCTA() {
  return (
    <section className="mx-auto w-full max-w-[1420px] px-5 py-6">
      <div
        dir="rtl"
        className="relative flex min-h-[160px] items-center justify-between gap-6 overflow-hidden rounded-[12px] border border-white/60 px-10 py-14"
        style={{
          background:
            "linear-gradient(135deg, #d4f5ec 0%, #a8e6d4 30%, #c5e8f0 60%, #e8d5f5 100%)",
        }}
      >
        <div className="flex max-w-lg flex-col gap-1.5">
          <p className="font-sans text-[13px] font-bold uppercase tracking-wide text-[#1A8C6A] italic">
            משכירים?
          </p>
          <h2 className="font-sans text-[22px] font-black leading-tight text-black">
            העלו ציוד ותתחילו להרוויח
          </h2>
          <p className="max-w-sm font-assistant text-[14px] leading-relaxed text-black/60">
            העלו מודעה, הגדירו מחיר ותאריכים — ומצאו שוכרים. פשוט ובטוח.
          </p>
        </div>

        <Link
          href="/add"
          className="shrink-0 rounded-full border border-black/20 bg-white/70 px-6 py-2.5 font-sans text-[14px] font-bold text-black backdrop-blur-sm transition-colors duration-200 hover:bg-white"
        >
          העלו מודעה ↑
        </Link>
      </div>
    </section>
  );
}
