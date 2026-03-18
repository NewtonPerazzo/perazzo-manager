import { Card } from "@/components/atoms/card";
import { Skeleton } from "@/components/atoms/skeleton";

export default function DashboardLoading() {
  return (
    <div className="grid gap-4">
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full max-w-[220px] sm:max-w-[320px]" />
          </div>
          <Skeleton className="h-10 w-full max-w-[140px] rounded-xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
