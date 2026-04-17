"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileViewer({ content, filename }: { content: string; filename: string }) {
  const [copied, setCopied] = React.useState(false);
  const [wrap, setWrap] = React.useState(true);

  const isJson = filename.toLowerCase().endsWith(".json");
  const formatted = React.useMemo(() => {
    if (!isJson) return content;
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  }, [content, isJson]);

  const lineCount = React.useMemo(() => formatted.split("\n").length, [formatted]);

  async function copy() {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">
          {lineCount.toLocaleString()} lines · {formatted.length.toLocaleString()} chars
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setWrap((w) => !w)}>
            {wrap ? "No wrap" : "Wrap"}
          </Button>
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      <pre
        className={`max-h-[calc(100vh-260px)] overflow-auto p-4 font-mono text-xs leading-relaxed ${
          wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
      >
        {formatted}
      </pre>
    </div>
  );
}
