import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className="font-display text-xl font-extrabold uppercase tracking-tighter"
        >
          events<span className="text-primary">-</span>lab
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/auth"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/auth"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
