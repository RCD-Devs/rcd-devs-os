"use client";

import { useTransition } from "react";
import { actualizarEtapaProyecto } from "./actions";
import { Select } from "@/components/ui/Select";

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
    <Select
      defaultValue={etapaActualId}
      disabled={isPending}
      onChange={(e) => {
        const etapaId = e.target.value;
        startTransition(() => {
          actualizarEtapaProyecto(proyectoId, etapaId);
        });
      }}
    >
      {etapas.map((etapa) => (
        <option key={etapa.id} value={etapa.id}>
          {etapa.orden}. {etapa.nombre}
        </option>
      ))}
    </Select>
  );
}
