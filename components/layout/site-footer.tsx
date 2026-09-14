import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-display text-lg font-extrabold uppercase tracking-tighter">
          events<span className="text-primary">-</span>lab
        </div>
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Link
            href="/discover"
            className="transition-colors hover:text-foreground"
          >
            Discover
          </Link>
          <Link
            href="/auth?mode=signup"
            className="transition-colors hover:text-foreground"
          >
            Start publishing
          </Link>
          <span>Prototype — no live data</span>
        </div>
      </div>
    </footer>
  );
}
