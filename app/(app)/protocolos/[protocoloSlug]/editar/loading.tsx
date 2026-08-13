import { Skeleton } from "@/components/ui/Skeleton";

export default function EditarProtocoloLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-72" />

      <div className="mt-6 space-y-2">
        <Skeleton className="h-4 w-full max-w-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
        <Skeleton className="mt-2 h-9 w-32" />
      </div>
    </div>
  );
}
