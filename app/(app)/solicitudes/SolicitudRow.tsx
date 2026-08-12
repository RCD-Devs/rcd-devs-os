"use client";

import { useTransition } from "react";
import { actualizarEstadoSolicitud, ESTADOS_SOLICITUD } from "./actions";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

const BADGE_POR_ESTADO: Record<string, string> = {
  Pendiente: "bg-neutral-badge-bg text-neutral-badge",
  "En curso": "bg-warning-bg text-warning",
  Resuelta: "bg-success-bg text-success",
  Rechazada: "bg-chart-5-bg text-chart-5",
};

export function SolicitudRow({
  solicitud,
}: {
  solicitud: {
    id: string;
    tipo: string;
    descripcion: string | null;
    estado: string;
    slaFechaLimite: Date | null;
    proyecto: { nombre: string };
    responsableRol: { nombre: string };
    solicitante: { nombre: string | null; email: string };
  };
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{solicitud.tipo}</p>
          <p className="text-sm text-text-muted">
            {solicitud.proyecto.nombre} · responsable: {solicitud.responsableRol.nombre}
          </p>
          {solicitud.descripcion && (
            <p className="mt-1 text-sm text-text-muted">{solicitud.descripcion}</p>
          )}
          <p className="mt-1 font-mono text-xs text-text-muted">
            Solicitado por {solicitud.solicitante.nombre ?? solicitud.solicitante.email}
            {solicitud.slaFechaLimite &&
              ` · limite ${new Date(solicitud.slaFechaLimite).toLocaleDateString("es-CL")}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${BADGE_POR_ESTADO[solicitud.estado] ?? BADGE_POR_ESTADO.Pendiente}`}
          >
            {solicitud.estado}
          </span>
          <Select
            value={solicitud.estado}
            disabled={isPending}
            onChange={(e) => {
              const estado = e.target.value;
              startTransition(async () => {
                try {
                  await actualizarEstadoSolicitud(solicitud.id, estado);
                  showToast("Estado actualizado");
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "No se pudo actualizar", "error");
                }
              });
            }}
          >
            {ESTADOS_SOLICITUD.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
}
