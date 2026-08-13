"use client";

import { useTransition } from "react";
import { actualizarRolUsuario } from "./actions";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

export function UsuarioRow({
  usuario,
  roles,
}: {
  usuario: { id: string; nombre: string | null; email: string; rolId: string | null };
  roles: Array<{ id: string; nombre: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar nombre={usuario.nombre ?? usuario.email} />
        <div>
          <p className="font-medium">{usuario.nombre ?? usuario.email}</p>
          {usuario.nombre && <p className="text-sm text-text-muted">{usuario.email}</p>}
        </div>
      </div>

      <Select
        defaultValue={usuario.rolId ?? ""}
        disabled={isPending}
        onChange={(e) => {
          const rolId = e.target.value;
          startTransition(async () => {
            try {
              await actualizarRolUsuario(usuario.id, rolId);
              showToast("Rol actualizado");
            } catch (err) {
              showToast(err instanceof Error ? err.message : "No se pudo guardar", "error");
            }
          });
        }}
      >
        <option value="">Sin rol</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nombre}
          </option>
        ))}
      </Select>
    </Card>
  );
}
