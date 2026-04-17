import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getVendors, getVendorBySlug, readPromptFile } from "@/lib/prompts";
import { CompareClient } from "./compare-client";

export function generateStaticParams() {
  return getVendors().map((v) => ({ vendor: v.slug }));
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ vendor: string }>;
  searchParams: Promise<{ a?: string; b?: string; mode?: string }>;
}) {
  const { vendor: slug } = await params;
  const sp = await searchParams;
  const vendor = getVendorBySlug(slug);
  if (!vendor) notFound();

  const promptFiles = vendor.files.filter((f) => f.kind === "prompt");

  if (promptFiles.length < 2) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href={`/${vendor.slug}`}
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} mb-4 -ml-2 text-muted-foreground`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {vendor.name}
        </Link>
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-semibold tracking-tight">{vendor.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This vendor only has one prompt file — nothing to compare.
          </p>
        </div>
      </div>
    );
  }

  const a = sp.a ?? promptFiles[0].relPath;
  const b = sp.b ?? promptFiles[1].relPath;
  const mode: "diff" | "side" = sp.mode === "side" ? "side" : "diff";

  const fileA =
    vendor.files.find((f) => f.relPath === a) ?? promptFiles[0];
  const fileB =
    vendor.files.find((f) => f.relPath === b) ?? promptFiles[1];

  const contentA = readPromptFile(fileA.absPath);
  const contentB = readPromptFile(fileB.absPath);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/${vendor.slug}`}
        className={`${buttonVariants({ variant: "ghost", size: "sm" })} mb-4 -ml-2 text-muted-foreground`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {vendor.name}
      </Link>

      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {vendor.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Compare prompts</p>
      </div>

      <div className="mt-6">
        <CompareClient
          vendorSlug={vendor.slug}
          files={promptFiles.map((f) => ({
            relPath: f.relPath,
            name: f.name,
            size: f.size,
          }))}
          a={fileA.relPath}
          b={fileB.relPath}
          mode={mode}
          contentA={contentA}
          contentB={contentB}
        />
      </div>
    </div>
  );
}
