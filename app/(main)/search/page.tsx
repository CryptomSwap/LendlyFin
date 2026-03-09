import { Suspense } from "react";
import SearchClient from "./search-client";
import { LoadingBlock } from "@/components/ui/loading-block";

function SearchFallback() {
  return (
    <div className="min-h-[200px] flex flex-col justify-center" dir="rtl">
      <LoadingBlock message="טוען חיפוש..." variant="full" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen pb-6 md:pb-10 w-full app-page-bg overflow-x-hidden" dir="rtl">
      <Suspense fallback={<SearchFallback />}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
