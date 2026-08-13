"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { actualizarAsignacionRol, actualizarEsAdminRol } from "./actions";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

type Usuario = { id: string; nombre: string | null; email: string };

export function RolRow({
  rol,
  usuarios,
}: {
  rol: {
    id: string;
    nombre: string;
    titularId: string | null;
    reemplazoId: string | null;
    esAdmin: boolean;
  };
  usuarios: Usuario[];
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [esAdminLocal, setEsAdminLocal] = useState(rol.esAdmin);

  function asignar(campo: "titularId" | "reemplazoId", usuarioId: string) {
    startTransition(async () => {
      const result = await actualizarAsignacionRol(rol.id, campo, usuarioId || null);
      if (!result.ok) {
        showToast(result.error, "error");
      } else {
        showToast("Asignacion guardada");
      }
    });
  }

  function alternarAdmin() {
    const nuevoValor = !esAdminLocal;
    setEsAdminLocal(nuevoValor);
    startTransition(async () => {
      const result = await actualizarEsAdminRol(rol.id, nuevoValor);
      if (!result.ok) {
        setEsAdminLocal(!nuevoValor);
        showToast(result.error, "error");
      } else {
        showToast(nuevoValor ? "Acceso admin activado" : "Acceso admin desactivado");
      }
    });
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="font-medium">{rol.nombre}</p>
        {esAdminLocal && (
          <span className="flex items-center gap-1 rounded-full bg-chart-2-bg px-2 py-0.5 text-xs font-medium text-chart-2">
            <ShieldCheck size={11} strokeWidth={2} />
            Admin
          </span>
        )}
      </div>

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

        <label className="flex items-center gap-1.5 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={esAdminLocal}
            disabled={isPending}
            onChange={alternarAdmin}
            className="size-4 rounded border-border accent-accent"
          />
          Acceso admin
        </label>
      </div>
    </Card>
  );
}
