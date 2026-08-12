import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-text">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      </div>
    </Card>
  );
}
