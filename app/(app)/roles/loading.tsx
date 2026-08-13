import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RolesLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="mt-2 h-4 w-96" />

      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-36" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
