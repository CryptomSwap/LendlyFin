import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin";

/**
 * Root route: signed-in users go to search (their home); signed-out go to marketing homepage.
 */
export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/search");
  }
  redirect("/home");
}
