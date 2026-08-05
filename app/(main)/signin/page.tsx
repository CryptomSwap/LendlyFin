import { getServerSession } from "next-auth";
import { authOptions, isGoogleProviderConfigured } from "@/lib/auth/nextauth-options";
import { redirect } from "next/navigation";
import SignInGoogleButton from "@/components/sign-in-google-button";
import { PageContainer } from "@/components/layout";

export const runtime = "nodejs";

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/profile");
  }

  const { callbackUrl, error } = await searchParams;
  const callback = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/profile";
  const isOAuthSigninError = error === "OAuthSignin";
  const hasAuthError = typeof error === "string" && error.length > 0;
  const showGoogleButton = isGoogleProviderConfigured;

  return (
    <div className="min-h-screen w-full bg-white" dir="rtl">
      <PageContainer width="narrow" className="flex items-center justify-center py-16">
        <div className="w-full max-w-sm space-y-6 rounded-[8px] border border-black/10 bg-white p-8 text-center">
          <p className="font-sans text-[28px] font-black text-[#1A8C6A]">לנדלי</p>

          <div className="space-y-2">
            <h1 className="font-sans text-[22px] font-black text-black">
              התחברות או הרשמה
            </h1>
            <p className="font-assistant text-[14px] leading-relaxed text-[#888888]">
              המשך עם חשבון Google כדי להעלות מודעות, להזמין או לנהל את הפרופיל.
            </p>
          </div>

          <div className="border-t border-black/[0.08]" />

          {isOAuthSigninError && (
            <div
              className="rounded-[8px] border border-[#1A8C6A]/20 bg-[#F0FAF6] p-4 text-right text-sm"
              role="alert"
            >
              <p className="font-sans font-bold text-black">שגיאה בהתחברות עם Google</p>
              <p className="mt-1 font-assistant text-[#888888]">
                וודא ש־GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ו־NEXTAUTH_URL מוגדרים ב־.env.local,
                ושה־Redirect URI ב־Google Cloud Console הוא בדיוק:
              </p>
              <p className="mt-2 break-all font-mono text-xs text-black">
                http://localhost:3000/api/auth/callback/google
              </p>
            </div>
          )}

          {hasAuthError && !isOAuthSigninError && (
            <div
              className="rounded-[8px] border border-red-200 bg-red-50 p-4 text-right text-sm"
              role="alert"
            >
              <p className="font-sans font-bold text-black">ההתחברות נכשלה</p>
              <p className="mt-1 font-assistant text-[#888888]">קוד שגיאה: {error}</p>
            </div>
          )}

          {!showGoogleButton && !isOAuthSigninError && (
            <div
              className="rounded-[8px] border border-black/10 bg-black/[0.02] p-4 text-right text-sm"
              role="status"
            >
              <p className="font-sans font-bold text-black">התחברות עם Google אינה מוגדרת</p>
              <p className="mt-1 font-assistant text-[#888888]">
                הגדר ב־.env.local: NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
              </p>
              <p className="mt-2 break-all font-mono text-xs text-[#888888]">
                Google Console: Origin http://localhost:3000 · Redirect http://localhost:3000/api/auth/callback/google
              </p>
              <p className="mt-2 font-assistant text-xs text-[#AAAAAA]">ראה docs/LOCAL_GOOGLE_AUTH.md</p>
            </div>
          )}

          {showGoogleButton && <SignInGoogleButton callbackUrl={callback} />}

          <p className="font-assistant text-[11px] text-[#AAAAAA]">
            בהתחברות אתם מאשרים את תנאי השימוש
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
