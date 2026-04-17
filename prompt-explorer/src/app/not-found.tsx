import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vendor not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We don&apos;t have that vendor in the archive.
      </p>
      <Link href="/" className={`${buttonVariants()} mt-6`}>
        Back to all vendors
      </Link>
    </div>
  );
}
