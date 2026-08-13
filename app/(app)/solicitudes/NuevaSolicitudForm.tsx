"use client";

import { useId, useState, type FormEvent } from "react";
import { crearSolicitud } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function NuevaSolicitudForm({
  proyectos,
  roles,
}: {
  proyectos: Array<{ id: string; nombre: string }>;
  roles: Array<{ id: string; nombre: string }>;
}) {
  const { showToast } = useToast();
  const idBase = useId();
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id ?? "");
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsableRolId, setResponsableRolId] = useState(roles[0]?.id ?? "");
  const [slaFechaLimite, setSlaFechaLimite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await crearSolicitud({
        proyectoId,
        tipo,
        descripcion,
        responsableRolId,
        slaFechaLimite,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setTipo("");
        setDescripcion("");
        setSlaFechaLimite("");
        showToast("Solicitud creada");
      }
    } catch {
      // Un error no controlado (500, red caida) no debe dejar el boton
      // pegado en "Creando..." para siempre: sin este catch, una excepcion
      // ademas del texto amarra el estado a loading=true de por vida.
      setError("Ocurrio un error inesperado, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  if (proyectos.length === 0 || roles.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Necesitas al menos un proyecto y un rol creados antes de generar una solicitud.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor={`${idBase}-proyecto`} className="text-sm text-text-muted">
            Proyecto
          </label>
          <Select
            id={`${idBase}-proyecto`}
            value={proyectoId}
            onChange={(e) => setProyectoId(e.target.value)}
            className="w-full"
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label htmlFor={`${idBase}-rol`} className="text-sm text-text-muted">
            Rol responsable
          </label>
          <Select
            id={`${idBase}-rol`}
            value={responsableRolId}
            onChange={(e) => setResponsableRolId(e.target.value)}
            className="w-full"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-tipo`} className="text-sm text-text-muted">
          Tipo de solicitud
        </label>
        <Input
          id={`${idBase}-tipo`}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Ej: Creacion de ambiente de staging"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-descripcion`} className="text-sm text-text-muted">
          Descripcion (opcional)
        </label>
        <Input
          id={`${idBase}-descripcion`}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-sla`} className="text-sm text-text-muted">
          Fecha limite (opcional)
        </label>
        <Input
          id={`${idBase}-sla`}
          type="date"
          value={slaFechaLimite}
          onChange={(e) => setSlaFechaLimite(e.target.value)}
          className="w-fit"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Creando..." : "Crear solicitud"}
      </Button>
    </form>
  );
}
