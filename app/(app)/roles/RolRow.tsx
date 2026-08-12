"use client";

import { useTransition } from "react";
import { actualizarAsignacionRol } from "./actions";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

type Usuario = { id: string; nombre: string | null; email: string };

export function RolRow({
  rol,
  usuarios,
}: {
  rol: { id: string; nombre: string; titularId: string | null; reemplazoId: string | null };
  usuarios: Usuario[];
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function asignar(campo: "titularId" | "reemplazoId", usuarioId: string) {
    startTransition(async () => {
      try {
        await actualizarAsignacionRol(rol.id, campo, usuarioId || null);
        showToast("Asignacion guardada");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "No se pudo guardar", "error");
      }
    });
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <p className="font-medium">{rol.nombre}</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-text-muted">
          Titular
          <Select
            defaultValue={rol.titularId ?? ""}
            disabled={isPending}
            onChange={(e) => asignar("titularId", e.target.value)}
          >
            <option value="">Sin asignar</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre ?? u.email}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          Reemplazo
          <Select
            defaultValue={rol.reemplazoId ?? ""}
            disabled={isPending}
            onChange={(e) => asignar("reemplazoId", e.target.value)}
          >
            <option value="">Sin asignar</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre ?? u.email}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </Card>
  );
}
