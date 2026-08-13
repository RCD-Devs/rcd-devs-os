import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AuditoriaLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-96" />

      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between gap-3 py-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>
    </div>
  );
}
