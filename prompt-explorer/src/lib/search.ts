import { getVendors, readPromptFile } from "./prompts";

export type SearchSnippet = {
  line: number;
  before: string;
  match: string;
  after: string;
};

export type SearchHit = {
  vendorSlug: string;
  vendorName: string;
  relPath: string;
  fileName: string;
  matchCount: number;
  snippets: SearchSnippet[];
};

const SNIPPET_CONTEXT = 60;
const MAX_SNIPPETS_PER_FILE = 3;

export function searchPrompts(query: string, limit = 50): SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const needle = trimmed.toLowerCase();
  const needleLen = needle.length;
  const hits: SearchHit[] = [];

  for (const vendor of getVendors()) {
    for (const file of vendor.files) {
      if (file.kind !== "prompt") continue;

      let content: string;
      try {
        content = readPromptFile(file.absPath);
      } catch {
        continue;
      }

      const lines = content.split("\n");
      let matchCount = 0;
      const snippets: SearchSnippet[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();
        let from = 0;
        while (from <= lower.length) {
          const idx = lower.indexOf(needle, from);
          if (idx === -1) break;
          matchCount++;
          if (snippets.length < MAX_SNIPPETS_PER_FILE) {
            const beforeStart = Math.max(0, idx - SNIPPET_CONTEXT);
            const afterEnd = Math.min(line.length, idx + needleLen + SNIPPET_CONTEXT);
            snippets.push({
              line: i + 1,
              before: (beforeStart > 0 ? "…" : "") + line.slice(beforeStart, idx),
              match: line.slice(idx, idx + needleLen),
              after: line.slice(idx + needleLen, afterEnd) + (afterEnd < line.length ? "…" : ""),
            });
          }
          from = idx + needleLen;
        }
      }

      if (matchCount > 0) {
        hits.push({
          vendorSlug: vendor.slug,
          vendorName: vendor.name,
          relPath: file.relPath,
          fileName: file.name,
          matchCount,
          snippets,
        });
      }
    }
  }

  hits.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.vendorName.localeCompare(b.vendorName);
  });

  return hits.slice(0, limit);
}
