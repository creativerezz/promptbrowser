import { Suspense } from "react";
import { SearchClient } from "./search-client";

export const metadata = {
  title: "Search prompts",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Search prompts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full-text search across every prompt file in the archive.
        </p>
      </div>
      <div className="mt-6">
        <Suspense fallback={null}>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
