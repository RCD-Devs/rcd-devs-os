import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProyectoDetalleLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="size-2.5 rounded-full" />
        <Skeleton className="h-7 w-56" />
      </div>
      <Skeleton className="mt-1 h-4 w-40" />

      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-48" />
      </div>

      <Skeleton className="mt-10 h-3 w-24" />
      <div className="mt-2 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-2 w-40" />
            </div>
            <Skeleton className="h-8 w-28" />
          </Card>
        ))}
      </div>
    </div>
  );
}
