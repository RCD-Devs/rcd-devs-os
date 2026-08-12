import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";

export default function ClientesLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-32" />

      <Card className="mt-4">
        <Skeleton className="h-9 w-full" />
      </Card>

      <div className="mt-6">
        <CardGridSkeleton count={6} cols="sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </div>
  );
}
