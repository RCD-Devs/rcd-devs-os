import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-64" />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex items-center gap-4">
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Skeleton className="h-60 w-full" />
        </Card>
        <Card>
          <Skeleton className="h-60 w-full" />
        </Card>
      </div>

      <Skeleton className="mt-10 h-3 w-24" />
      <div className="mt-3">
        <CardGridSkeleton count={4} />
      </div>
    </div>
  );
}
