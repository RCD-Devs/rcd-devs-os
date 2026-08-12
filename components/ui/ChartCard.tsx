import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function ChartCard({
  title,
  subtitle,
  height = 240,
  children,
}: {
  title: string;
  subtitle?: string;
  height?: number;
  children: ReactNode;
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      <div className="mt-4" style={{ height }}>
        {children}
      </div>
    </Card>
  );
}
