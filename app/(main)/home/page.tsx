import { RedesignHomePage } from "@/components/home/RedesignHomePage";
import { getCurrentUser } from "@/lib/admin";
import { getActiveListingCountsByCategory, getFeaturedListings } from "@/lib/listings";

const PATH_ADD = "/add";
const PATH_SIGNIN = "/signin";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [featuredListings, categoryCounts] = await Promise.all([
    getFeaturedListings(8),
    getActiveListingCountsByCategory(),
  ]);
  const publishHref = user ? PATH_ADD : PATH_SIGNIN;

  return (
    <RedesignHomePage
      listings={featuredListings}
      categoryCounts={categoryCounts}
      publishHref={publishHref}
      isSignedIn={!!user}
    />
  );
}
