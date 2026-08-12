import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";

export default function ProyectosLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />

      <Card className="mt-6">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>

      <div className="mt-6">
        <CardGridSkeleton count={4} />
      </div>
    </div>
  );
}
