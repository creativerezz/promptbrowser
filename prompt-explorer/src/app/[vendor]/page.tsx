import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Wrench, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getVendors, getVendorBySlug, readPromptFile, getPromptFiles } from "@/lib/prompts";
import { formatBytes } from "@/lib/utils";
import { FileViewer } from "./file-viewer";

export function generateStaticParams() {
  return getVendors().map((v) => ({ vendor: v.slug }));
}

export default async function VendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ vendor: string }>;
  searchParams: Promise<{ file?: string }>;
}) {
  const { vendor: slug } = await params;
  const { file } = await searchParams;
  const vendor = getVendorBySlug(slug);
  if (!vendor) notFound();

  const selected =
    (file && vendor.files.find((f) => f.relPath === file)) ?? vendor.files[0];

  const content = selected ? readPromptFile(selected.absPath) : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className={`${buttonVariants({ variant: "ghost", size: "sm" })} mb-4 -ml-2 text-muted-foreground`}
      >
        <ArrowLeft className="h-4 w-4" />
        All vendors
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{vendor.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {vendor.files.length} file{vendor.files.length === 1 ? "" : "s"} ·{" "}
            {formatBytes(vendor.totalBytes)}
          </p>
        </div>
        {getPromptFiles(vendor).length >= 2 ? (
          <Link
            href={`/${vendor.slug}/compare`}
            className={`${buttonVariants({ variant: "outline", size: "sm" })} gap-2`}
          >
            <GitCompare className="h-4 w-4" />
            Compare versions
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="order-2 lg:order-1">
          <div className="sticky top-20 space-y-1">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Files
            </p>
            <nav className="max-h-[calc(100vh-140px)] overflow-y-auto rounded-md border border-border bg-card p-1">
              {vendor.files.map((f) => {
                const isActive = selected && f.relPath === selected.relPath;
                const Icon = f.kind === "tools" ? Wrench : FileText;
                return (
                  <Link
                    key={f.relPath}
                    href={`/${vendor.slug}?file=${encodeURIComponent(f.relPath)}`}
                    className={`flex items-start gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                    scroll={false}
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 break-all">{f.relPath}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="order-1 lg:order-2 min-w-0">
          {selected ? (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {selected.relPath}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selected.kind === "tools" ? "muted" : "secondary"}>
                    {selected.kind}
                  </Badge>
                  <Badge variant="outline">{formatBytes(selected.size)}</Badge>
                </div>
              </div>
              <FileViewer content={content} filename={selected.name} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No files.</p>
          )}
        </div>
      </div>
    </div>
  );
}
