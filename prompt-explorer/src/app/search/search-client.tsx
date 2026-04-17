"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SearchHit } from "@/lib/search";

type SearchResponse = {
  hits: SearchHit[];
  totalFiles: number;
  query: string;
};

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = React.useState(initialQ);
  const [debounced, setDebounced] = React.useState(initialQ);
  const [results, setResults] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeQuery, setActiveQuery] = React.useState(initialQ);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debounced) params.set("q", debounced);
    else params.delete("q");
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/search?${next}` : "/search", { scroll: false });
    }
  }, [debounced, router, searchParams]);

  React.useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setActiveQuery(q);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => r.json() as Promise<SearchResponse>)
      .then((data) => {
        setResults(data.hits);
        setActiveQuery(data.query);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [debounced]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, { vendorName: string; vendorSlug: string; hits: SearchHit[] }>();
    for (const hit of results) {
      const entry = map.get(hit.vendorSlug);
      if (entry) entry.hits.push(hit);
      else
        map.set(hit.vendorSlug, {
          vendorName: hit.vendorName,
          vendorSlug: hit.vendorSlug,
          hits: [hit],
        });
    }
    return Array.from(map.values());
  }, [results]);

  const trimmed = query.trim();
  const showEmptyPrompt = trimmed.length < 2 && !loading;
  const showNoResults = trimmed.length >= 2 && !loading && results.length === 0;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across every prompt..."
          className="pl-9"
        />
      </div>

      {loading && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Searching…
        </div>
      )}

      {showEmptyPrompt && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search.
        </div>
      )}

      {showNoResults && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No matches for &ldquo;{activeQuery}&rdquo;
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {results.length} file{results.length === 1 ? "" : "s"} matched
          </p>
          <div className="space-y-6">
            {grouped.map((group) => (
              <section key={group.vendorSlug} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold tracking-tight">{group.vendorName}</h2>
                  <Link
                    href={`/${group.vendorSlug}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Open vendor →
                  </Link>
                </div>
                <div className="space-y-3">
                  {group.hits.map((hit) => (
                    <Link
                      key={`${hit.vendorSlug}-${hit.relPath}`}
                      href={`/${hit.vendorSlug}?file=${encodeURIComponent(hit.relPath)}`}
                      className="block"
                    >
                      <Card className="transition-colors hover:border-foreground/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="flex min-w-0 items-center gap-2 text-sm">
                              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate font-mono">{hit.relPath}</span>
                            </CardTitle>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge variant="muted">{hit.matchCount} match{hit.matchCount === 1 ? "" : "es"}</Badge>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                          {hit.snippets.map((s, i) => (
                            <div
                              key={i}
                              className={cn(
                                "font-mono text-xs text-muted-foreground",
                                "rounded border border-border/60 bg-background/40 px-2 py-1.5",
                              )}
                            >
                              <span className="mr-2 text-muted-foreground/60">L{s.line}</span>
                              <span>{s.before}</span>
                              <mark className="bg-yellow-500/30 text-foreground rounded px-0.5">
                                {s.match}
                              </mark>
                              <span>{s.after}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
