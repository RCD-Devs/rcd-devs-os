import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChecklistLoading() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="mt-2 h-7 w-64" />

      <Card className="mt-4 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-2.5 w-40 rounded-full" />
        </div>
      </Card>

      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-32" />
          </Card>
        ))}
      </div>
    </div>
  );
}
