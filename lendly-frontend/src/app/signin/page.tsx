import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignInPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-[12px] border border-black/10 bg-white p-8 text-center space-y-6">

        {/* Logo */}
        <p className="font-sans text-[28px] font-black text-[#1A8C6A]">
          לנדלי
        </p>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-sans text-[22px] font-black text-black">
            התחברות או הרשמה
          </h1>
          <p className="font-assistant text-[14px] text-[#888888] leading-relaxed">
            המשך עם חשבון Google כדי להעלות מודעות, להזמין או לנהל את הפרופיל.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] my-2" />

        {/* Google button */}
        <button
          type="button"
          className="w-full rounded-full border border-black/15 bg-white px-6 py-3.5 font-sans text-[15px] font-bold text-black flex items-center justify-center gap-3 hover:bg-black/5 transition-colors duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
              fill="#4285F4"
            />
            <path
              d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
              fill="#34A853"
            />
            <path
              d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
              fill="#EA4335"
            />
          </svg>
          המשך עם Google
        </button>

        {/* Fine print */}
        <p className="font-assistant text-[11px] text-[#AAAAAA]">
          בהתחברות אתם מאשרים את תנאי השימוש
        </p>
      </div>
      </div>
      <Footer />
    </div>
  );
}
