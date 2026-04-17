import { Badge } from "@/components/ui/badge";
import { VendorGrid, type VendorSummary } from "@/components/vendor-grid";
import { getVendors, getVendorStats } from "@/lib/prompts";
import { formatBytes } from "@/lib/utils";

export default function HomePage() {
  const vendors = getVendors();
  const stats = getVendorStats();

  const summaries: VendorSummary[] = vendors.map((v) => ({
    name: v.name,
    slug: v.slug,
    fileCount: v.files.length,
    promptCount: v.files.filter((f) => f.kind === "prompt").length,
    toolsCount: v.files.filter((f) => f.kind === "tools").length,
    totalBytes: v.totalBytes,
  }));

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 h-[420px] grid-bg opacity-50" aria-hidden />

      <section className="relative mx-auto max-w-6xl px-4 pb-6 pt-16 sm:px-6 sm:pt-24">
        <Badge variant="muted" className="mb-4">Archive · {stats.vendorCount} vendors</Badge>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          The system prompts running the AI coding agents you use.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A browsable index of leaked and published system prompts and tool schemas from Cursor,
          v0, Claude Code, Codex CLI, Devin, Windsurf, and {stats.vendorCount - 6} more.
        </p>

        <div className="mt-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <StatChip label="Vendors" value={stats.vendorCount.toString()} />
          <StatChip label="Files" value={stats.totalFiles.toString()} />
          <StatChip label="Total size" value={formatBytes(stats.totalBytes)} />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <VendorGrid vendors={summaries} />
      </section>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 backdrop-blur">
      <span className="font-mono text-xs tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
