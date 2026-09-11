"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DATE_RANGES } from "@/features/discovery/contracts";
import { cn } from "@/lib/format";
import type { Category } from "@/lib/types";

const RANGE_LABELS: Record<(typeof DATE_RANGES)[number], string> = {
  upcoming: "All upcoming",
  today: "Today",
  week: "This week",
  month: "This month",
};

/**
 * The reference implements these chips as bare buttons whose only selected
 * indicator is colour. ui-rules.md §13 forbids that, so each chip is a real
 * toggle carrying `aria-pressed` plus a non-colour marker.
 */
function FilterChip({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "rounded border px-3 py-1 font-mono text-xs uppercase transition-colors",
        isActive
          ? "border-primary text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive && <span aria-hidden>✓ </span>}
      {children}
    </button>
  );
}

export function DiscoverFilters({
  categories,
}: {
  categories: readonly Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeRange = searchParams.get("range") ?? "upcoming";
  const activeCategory = searchParams.get("category");
  const activeQuery = searchParams.get("q") ?? "";

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(`/discover?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      <search>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q");
            update({ q: String(value ?? "").trim() || undefined });
          }}
          className="flex max-w-2xl items-center gap-2"
        >
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              // Uncontrolled and keyed on the URL, so navigation resets the
              // field without an effect syncing state back into React.
              key={activeQuery}
              type="search"
              name="q"
              defaultValue={activeQuery}
              placeholder="Search events, cities, venues…"
              aria-label="Search events"
              className="w-full rounded-md border border-border bg-card py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Search
          </button>
        </form>
      </search>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span
          id="filter-when"
          className="mr-2 font-mono text-xs uppercase text-muted-foreground"
        >
          When
        </span>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter by date range</legend>
          {DATE_RANGES.map((range) => (
            <FilterChip
              key={range}
              isActive={activeRange === range}
              onClick={() =>
                update({ range: range === "upcoming" ? undefined : range })
              }
            >
              {RANGE_LABELS[range]}
            </FilterChip>
          ))}
        </fieldset>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          id="filter-category"
          className="mr-2 font-mono text-xs uppercase text-muted-foreground"
        >
          Category
        </span>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filter by category</legend>
          <FilterChip
            isActive={!activeCategory}
            onClick={() => update({ category: undefined })}
          >
            All
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              isActive={activeCategory === category.slug}
              onClick={() => update({ category: category.slug })}
            >
              {category.label}
            </FilterChip>
          ))}
        </fieldset>
      </div>
    </>
  );
}
