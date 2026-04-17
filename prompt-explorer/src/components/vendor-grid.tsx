"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, Search, Wrench } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";

export type VendorSummary = {
  name: string;
  slug: string;
  fileCount: number;
  promptCount: number;
  toolsCount: number;
  totalBytes: number;
};

export function VendorGrid({ vendors }: { vendors: VendorSummary[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => v.name.toLowerCase().includes(q));
  }, [vendors, query]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${vendors.length} vendors...`}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No vendors match &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Link key={v.slug} href={`/${v.slug}`} className="group">
              <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="truncate">{v.name}</CardTitle>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <CardDescription>
                    {v.fileCount} file{v.fileCount === 1 ? "" : "s"} · {formatBytes(v.totalBytes)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {v.promptCount > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {v.promptCount} prompt{v.promptCount === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {v.toolsCount > 0 && (
                    <Badge variant="muted" className="gap-1">
                      <Wrench className="h-3 w-3" />
                      {v.toolsCount} tool{v.toolsCount === 1 ? "" : "s"}
                    </Badge>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  View prompts →
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
