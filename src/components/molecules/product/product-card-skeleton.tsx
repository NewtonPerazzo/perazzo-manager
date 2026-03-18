import { Skeleton } from "@/components/atoms/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-700 p-3">
      <div className="flex flex-col items-center">
        <Skeleton className="h-24 w-24 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-40" />
        <Skeleton className="mt-2 h-8 w-24 rounded-xl" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
