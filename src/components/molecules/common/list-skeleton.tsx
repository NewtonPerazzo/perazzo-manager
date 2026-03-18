import { Skeleton } from "@/components/atoms/skeleton";
import type { ReactNode } from "react";

interface ListSkeletonProps {
  items?: number;
  className?: string;
  itemClassName?: string;
  renderItem?: (index: number) => ReactNode;
}

export function ListSkeleton({ items = 3, className, itemClassName, renderItem }: ListSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index}>
          {renderItem ? renderItem(index) : <Skeleton className={itemClassName ?? "h-16 w-full rounded-xl"} />}
        </div>
      ))}
    </div>
  );
}
