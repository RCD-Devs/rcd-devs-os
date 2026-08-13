import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ClienteDetalleLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-56" />

      <Card className="mt-6 max-w-2xl space-y-4">
        <Skeleton className="h-9 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </Card>

      <Skeleton className="mt-8 h-3 w-32" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
