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
    <div className="min-h-screen pb-6" dir="rtl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          חיפוש
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          גלה ציוד להשכרה — חפש לפי קטגוריה, מחיר ומיון
        </p>
      </header>
      <Suspense fallback={<SearchFallback />}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
