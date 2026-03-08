import { getServerSession } from "next-auth";
import { authOptions, isGoogleProviderConfigured } from "@/lib/auth/nextauth-options";
import { redirect } from "next/navigation";
import SignInGoogleButton from "@/components/sign-in-google-button";

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
  const showGoogleButton = isGoogleProviderConfigured;

  return (
    <div className="max-w-md mx-auto space-y-6 text-center" dir="rtl">
      <h1 className="page-title">התחברות או הרשמה</h1>
      <p className="text-sm text-muted-foreground">
        המשך עם חשבון Google כדי להעלות מודעות, להזמין או לנהל את הפרופיל.
      </p>
      {isOAuthSigninError && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-right text-sm text-amber-900"
          role="alert"
        >
          <p className="font-medium">שגיאה בהתחברות עם Google</p>
          <p className="mt-1 text-amber-800">
            וודא ש־GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET ו־NEXTAUTH_URL מוגדרים ב־.env.local,
            ושה־Redirect URI ב־Google Cloud Console הוא בדיוק:
          </p>
          <p className="mt-2 font-mono text-xs break-all">http://localhost:3000/api/auth/callback/google</p>
        </div>
      )}
      {!showGoogleButton && !isOAuthSigninError && (
        <div
          className="rounded-lg border border-border bg-muted/50 p-4 text-right text-sm text-muted-foreground"
          role="status"
        >
          <p className="font-medium">התחברות עם Google אינה מוגדרת</p>
          <p className="mt-1">
            הגדר ב־.env.local: NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
          </p>
          <p className="mt-2 font-mono text-xs break-all">
            Google Console: Origin http://localhost:3000 · Redirect http://localhost:3000/api/auth/callback/google
          </p>
          <p className="mt-2 text-xs">ראה docs/LOCAL_GOOGLE_AUTH.md</p>
        </div>
      )}
      {showGoogleButton && <SignInGoogleButton callbackUrl={callback} />}
    </div>
  );
}
