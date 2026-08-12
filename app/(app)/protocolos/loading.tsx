import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";

export default function ProtocolosLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
      <CardGridSkeleton count={4} />
    </div>
  );
}
