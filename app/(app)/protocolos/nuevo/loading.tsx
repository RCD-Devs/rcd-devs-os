import { Skeleton } from "@/components/ui/Skeleton";

export default function NuevoProtocoloLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-56" />

      <div className="mt-6 space-y-4 max-w-2xl">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
