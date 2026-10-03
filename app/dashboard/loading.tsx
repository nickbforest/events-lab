import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while a dashboard screen loads. Shaped like the common layout — the
 * `DashboardHeader` block, then bordered panels — so the real screen lands
 * where the placeholder was.
 */
export default function DashboardLoading() {
  return (
    <LoadingRegion label="Loading" className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-64 md:h-12" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-36 rounded-2xl border border-border" />
          <Skeleton className="h-64 rounded-2xl border border-border" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-2xl border border-border" />
            <Skeleton className="h-48 rounded-2xl border border-border" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}
