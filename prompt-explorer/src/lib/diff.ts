import { diffLines } from "diff";

export type DiffSegment = {
  kind: "add" | "remove" | "equal";
  lines: { text: string; oldLine?: number; newLine?: number }[];
};

export function computeLineDiff(a: string, b: string): DiffSegment[] {
  const chunks = diffLines(a, b);
  const segments: DiffSegment[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const chunk of chunks) {
    const kind: DiffSegment["kind"] = chunk.added
      ? "add"
      : chunk.removed
        ? "remove"
        : "equal";

    const rawLines = chunk.value.split("\n");
    if (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
      rawLines.pop();
    }

    const lines: DiffSegment["lines"] = rawLines.map((text) => {
      if (kind === "equal") {
        const entry = { text, oldLine, newLine };
        oldLine++;
        newLine++;
        return entry;
      }
      if (kind === "add") {
        const entry = { text, newLine };
        newLine++;
        return entry;
      }
      const entry = { text, oldLine };
      oldLine++;
      return entry;
    });

    if (lines.length === 0) continue;

    const last = segments[segments.length - 1];
    if (last && last.kind === kind) {
      last.lines.push(...lines);
    } else {
      segments.push({ kind, lines });
    }
  }

  return segments;
}
