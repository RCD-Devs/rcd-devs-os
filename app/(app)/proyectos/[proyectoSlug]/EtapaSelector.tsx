"use client";

import { useTransition } from "react";
import { actualizarEtapaProyecto } from "./actions";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

export function EtapaSelector({
  proyectoId,
  proyectoSlug,
  etapas,
  etapaActualId,
}: {
  proyectoId: string;
  proyectoSlug: string;
  etapas: Array<{ id: string; nombre: string; orden: number }>;
  etapaActualId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <Select
      defaultValue={etapaActualId}
      disabled={isPending}
      onChange={(e) => {
        const etapaId = e.target.value;
        startTransition(async () => {
          const result = await actualizarEtapaProyecto(proyectoId, etapaId, proyectoSlug);
          if (!result.ok) {
            showToast(result.error, "error");
          } else {
            showToast("Etapa actualizada");
          }
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
