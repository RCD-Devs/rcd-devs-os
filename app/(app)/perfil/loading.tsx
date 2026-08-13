import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PerfilLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="mt-2 h-4 w-80" />

      <Card className="mt-6 max-w-md space-y-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-24" />
        <div className="space-y-2 border-t border-border pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    </div>
  );
}
