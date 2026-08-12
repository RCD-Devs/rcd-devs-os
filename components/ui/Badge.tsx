import { esEstadoTerminal } from "@/lib/protocolos/estados";

const VARIANT_CLASSES = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  neutral: "bg-neutral-badge-bg text-neutral-badge",
};

// "No aplica" es terminal pero no es un exito -> se pinta neutro, no verde.
function variantParaEstado(estado: string): keyof typeof VARIANT_CLASSES {
  if (estado === "No aplica") {
    return "neutral";
  }
  return esEstadoTerminal(estado) ? "success" : "warning";
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variantParaEstado(estado)]}`}
    >
      {estado}
    </span>
  );
}
