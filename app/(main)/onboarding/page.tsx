import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin";
import { needsOnboarding } from "@/lib/auth/onboarding";
import OnboardingForm from "./onboarding-form";

export const runtime = "nodejs";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin?callbackUrl=/onboarding");
  }
  if (!needsOnboarding(user)) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/profile");
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h1 className="page-title">השלם את הפרטים</h1>
      <p className="text-sm text-muted-foreground">
        נדרשים שמך המלא, מספר טלפון ועיר כדי להמשיך.
      </p>
      <OnboardingForm
        defaultName={user.name ?? ""}
        defaultPhone={user.phoneNumber ?? ""}
        defaultCity={user.city ?? ""}
      />
    </div>
  );
}
