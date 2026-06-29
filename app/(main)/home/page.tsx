import { RedesignHomePage } from "@/components/home/RedesignHomePage";
import { getCurrentUser } from "@/lib/admin";
import { getFeaturedListings } from "@/lib/listings";

const PATH_ADD = "/add";
const PATH_SIGNIN = "/signin";

export default async function HomePage() {
  const user = await getCurrentUser();
  const featuredListings = await getFeaturedListings(8);
  const publishHref = user ? PATH_ADD : PATH_SIGNIN;

  return <RedesignHomePage listings={featuredListings} publishHref={publishHref} />;
}
