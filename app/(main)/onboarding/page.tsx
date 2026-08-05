import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { PageContainer } from "@/components/layout";
import OnboardingForm from "./onboarding-form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin?callbackUrl=/onboarding");
  }
  if (!needsOnboarding(user)) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen w-full bg-white" dir="rtl">
      <PageContainer width="narrow" className="space-y-6 py-10">
        <div className="text-center">
          <p className="mb-4 font-sans text-[28px] font-black text-[#1A8C6A]">לנדלי</p>
          <h1 className="font-sans text-[22px] font-black text-black md:text-[28px]">
            השלם את הפרטים
          </h1>
          <p className="mt-2 font-assistant text-[14px] text-[#888888]">
            נדרשים שמך המלא, מספר טלפון ועיר כדי להמשיך.
          </p>
        </div>
        <OnboardingForm
          defaultName={user.name ?? ""}
          defaultPhone={user.phoneNumber ?? ""}
          defaultCity={user.city ?? ""}
        />
      </PageContainer>
    </div>
  );
}
