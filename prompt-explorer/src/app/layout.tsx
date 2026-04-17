import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Search } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Explorer",
  description: "Browse leaked & published system prompts from 30+ AI coding agents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  Prompt Explorer
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    href="/search"
                    className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-1"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Search
                  </Link>
                  <a
                    href="https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-1"
                  >
                    Source
                  </a>
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border py-6">
              <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
                Prompts are archived verbatim from their original sources. Explorer UI only.
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
