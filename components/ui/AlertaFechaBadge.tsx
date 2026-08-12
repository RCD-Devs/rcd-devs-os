import { AlertTriangle, Clock } from "lucide-react";
import type { AlertaFecha } from "@/lib/proyectos/alertaFecha";

const CLASSES = {
  vencido: "bg-chart-5-bg text-chart-5",
  proximo: "bg-warning-bg text-warning",
} as const;

const ICONOS = {
  vencido: AlertTriangle,
  proximo: Clock,
} as const;

export function AlertaFechaBadge({ alerta }: { alerta: AlertaFecha }) {
  const Icono = ICONOS[alerta.tone];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${CLASSES[alerta.tone]}`}
    >
      <Icono size={12} strokeWidth={2} />
      {alerta.texto}
    </span>
  );
}
