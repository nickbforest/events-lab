export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-display text-lg font-extrabold uppercase tracking-tighter">
          eventail<span className="text-primary">.</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 eventail.space All rights reserved.
        </p>
      </div>
    </footer>
  );
}
