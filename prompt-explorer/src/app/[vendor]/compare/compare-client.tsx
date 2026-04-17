"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GitCompare, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeLineDiff } from "@/lib/diff";

type FileMeta = { relPath: string; name: string; size: number };

type Props = {
  vendorSlug: string;
  files: FileMeta[];
  a: string;
  b: string;
  mode: "diff" | "side";
  contentA: string;
  contentB: string;
};

export function CompareClient({
  vendorSlug,
  files,
  a,
  b,
  mode,
  contentA,
  contentB,
}: Props) {
  const router = useRouter();
  const [onlyChanges, setOnlyChanges] = React.useState(false);

  const segments = React.useMemo(
    () => computeLineDiff(contentA, contentB),
    [contentA, contentB],
  );

  const visibleSegments = React.useMemo(
    () => (onlyChanges ? segments.filter((s) => s.kind !== "equal") : segments),
    [segments, onlyChanges],
  );

  function navigate(next: { a?: string; b?: string; mode?: "diff" | "side" }) {
    const params = new URLSearchParams();
    params.set("a", next.a ?? a);
    params.set("b", next.b ?? b);
    params.set("mode", next.mode ?? mode);
    router.replace(`/${vendorSlug}/compare?${params.toString()}`);
  }

  const fileA = files.find((f) => f.relPath === a);
  const fileB = files.find((f) => f.relPath === b);

  const selectClass =
    "h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-full";

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            A
          </span>
          <select
            className={selectClass}
            value={a}
            onChange={(e) => navigate({ a: e.target.value })}
          >
            {files.map((f) => (
              <option key={f.relPath} value={f.relPath}>
                {f.name}
              </option>
            ))}
          </select>
          <span className="px-1 text-muted-foreground">vs</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            B
          </span>
          <select
            className={selectClass}
            value={b}
            onChange={(e) => navigate({ b: e.target.value })}
          >
            {files.map((f) => (
              <option key={f.relPath} value={f.relPath}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={mode === "diff" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => navigate({ mode: "diff" })}
          >
            <GitCompare className="h-3.5 w-3.5" />
            Diff
          </Button>
          <Button
            variant={mode === "side" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => navigate({ mode: "side" })}
          >
            <Columns2 className="h-3.5 w-3.5" />
            Side-by-side
          </Button>
        </div>
      </div>

      {mode === "diff" ? (
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {segments.reduce(
                (sum, s) => sum + (s.kind === "add" ? s.lines.length : 0),
                0,
              )}{" "}
              added ·{" "}
              {segments.reduce(
                (sum, s) => sum + (s.kind === "remove" ? s.lines.length : 0),
                0,
              )}{" "}
              removed
            </span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyChanges}
                onChange={(e) => setOnlyChanges(e.target.checked)}
              />
              Show only changes
            </label>
          </div>
          <div className="max-h-[calc(100vh-260px)] overflow-auto font-mono text-xs leading-relaxed">
            {visibleSegments.map((seg, i) => (
              <div key={i}>
                {seg.lines.map((line, j) => {
                  const prefix =
                    seg.kind === "add"
                      ? "+"
                      : seg.kind === "remove"
                        ? "-"
                        : " ";
                  const rowClass =
                    seg.kind === "add"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : seg.kind === "remove"
                        ? "bg-rose-500/10 text-rose-300"
                        : "text-muted-foreground";
                  return (
                    <div
                      key={j}
                      className={cn(
                        "flex whitespace-pre",
                        rowClass,
                      )}
                    >
                      <span className="w-12 shrink-0 select-none px-2 text-right tabular-nums opacity-60">
                        {line.oldLine ?? ""}
                      </span>
                      <span className="w-12 shrink-0 select-none px-2 text-right tabular-nums opacity-60">
                        {line.newLine ?? ""}
                      </span>
                      <span className="w-5 shrink-0 select-none text-center opacity-80">
                        {prefix}
                      </span>
                      <span className="min-w-0 flex-1 pr-4">{line.text}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            {visibleSegments.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No differences.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4">
          <div>
            <p className="mb-2 truncate font-mono text-xs text-muted-foreground">
              {fileA?.relPath}
            </p>
            <pre className="whitespace-pre overflow-auto max-h-[calc(100vh-260px)] font-mono text-xs leading-relaxed p-4 bg-card rounded border border-border">
              {contentA}
            </pre>
          </div>
          <div>
            <p className="mb-2 truncate font-mono text-xs text-muted-foreground">
              {fileB?.relPath}
            </p>
            <pre className="whitespace-pre overflow-auto max-h-[calc(100vh-260px)] font-mono text-xs leading-relaxed p-4 bg-card rounded border border-border">
              {contentB}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
