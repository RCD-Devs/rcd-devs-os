"use client";

import { useTransition } from "react";
import { actualizarEtapaProyecto } from "./actions";

export function EtapaSelector({
  proyectoId,
  etapas,
  etapaActualId,
}: {
  proyectoId: string;
  etapas: Array<{ id: string; nombre: string; orden: number }>;
  etapaActualId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={etapaActualId}
      disabled={isPending}
      onChange={(e) => {
        const etapaId = e.target.value;
        startTransition(() => {
          actualizarEtapaProyecto(proyectoId, etapaId);
        });
      }}
      className="rounded border border-neutral-300 px-3 py-2 text-sm"
    >
      {etapas.map((etapa) => (
        <option key={etapa.id} value={etapa.id}>
          {etapa.orden}. {etapa.nombre}
        </option>
      ))}
    </select>
  );
}
