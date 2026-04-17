import fs from "node:fs";
import path from "node:path";
import { slugify } from "./utils";

export type PromptFile = {
  name: string;
  relPath: string;
  absPath: string;
  size: number;
  kind: "prompt" | "tools" | "other";
};

export type Vendor = {
  name: string;
  slug: string;
  files: PromptFile[];
  totalBytes: number;
  categories: string[];
};

const REPO_ROOT = path.resolve(process.cwd(), "..", "prompts");

function classifyFile(name: string): PromptFile["kind"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".json") && lower.includes("tool")) return "tools";
  if (lower.includes("tool") && (lower.endsWith(".json") || lower.endsWith(".txt"))) return "tools";
  if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".yaml") || lower.endsWith(".yml")) return "prompt";
  if (lower.endsWith(".json")) return "other";
  return "other";
}

function walk(dir: string, baseDir: string): PromptFile[] {
  const out: PromptFile[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, baseDir));
    } else if (entry.isFile()) {
      const rel = path.relative(baseDir, full);
      try {
        const stat = fs.statSync(full);
        out.push({
          name: entry.name,
          relPath: rel,
          absPath: full,
          size: stat.size,
          kind: classifyFile(entry.name),
        });
      } catch {
        // skip
      }
    }
  }
  return out;
}

let cachedVendors: Vendor[] | null = null;

export function getVendors(): Vendor[] {
  if (cachedVendors) return cachedVendors;

  const entries = fs.readdirSync(REPO_ROOT, { withFileTypes: true });
  const vendors: Vendor[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;

    const vendorDir = path.join(REPO_ROOT, entry.name);
    const files = walk(vendorDir, vendorDir);
    if (files.length === 0) continue;

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const categories = Array.from(
      new Set(
        files
          .map((f) => path.dirname(f.relPath))
          .filter((d) => d && d !== "."),
      ),
    );

    vendors.push({
      name: entry.name,
      slug: slugify(entry.name),
      files: files.sort((a, b) => a.relPath.localeCompare(b.relPath)),
      totalBytes,
      categories,
    });
  }

  cachedVendors = vendors.sort((a, b) => a.name.localeCompare(b.name));
  return cachedVendors;
}

export function getVendorBySlug(slug: string): Vendor | null {
  return getVendors().find((v) => v.slug === slug) ?? null;
}

export function readPromptFile(absPath: string, maxBytes = 2_000_000): string {
  const stat = fs.statSync(absPath);
  if (stat.size > maxBytes) {
    const buf = Buffer.alloc(maxBytes);
    const fd = fs.openSync(absPath, "r");
    fs.readSync(fd, buf, 0, maxBytes, 0);
    fs.closeSync(fd);
    return buf.toString("utf8") + "\n\n... [truncated] ...";
  }
  return fs.readFileSync(absPath, "utf8");
}

export function getVendorStats() {
  const vendors = getVendors();
  const totalFiles = vendors.reduce((s, v) => s + v.files.length, 0);
  const totalBytes = vendors.reduce((s, v) => s + v.totalBytes, 0);
  return { vendorCount: vendors.length, totalFiles, totalBytes };
}

export function getPromptFiles(vendor: Vendor): PromptFile[] {
  return vendor.files.filter((f) => f.kind === "prompt");
}
