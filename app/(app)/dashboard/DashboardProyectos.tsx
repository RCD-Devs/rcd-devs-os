"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderKanban } from "lucide-react";
import { AlertaFechaBadge } from "@/components/ui/AlertaFechaBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EtapaBadge } from "@/components/ui/EtapaBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { contarProgreso } from "@/lib/protocolos/estados";
import { alertaFechaCompromiso } from "@/lib/proyectos/alertaFecha";
import { calcularSemaforo } from "@/lib/proyectos/semaforo";
import { slugConId } from "@/lib/slug";

type Proyecto = {
  id: string;
  nombre: string;
  fechaCompromiso: Date | null;
  cliente: { id: string; nombre: string };
  etapaActual: { nombre: string; orden: number };
  ejecucionesProtocolo: Array<{
    estado: string;
    fechaLimite: Date | null;
    pasos: Array<{ estado: string }>;
    versionProtocolo: { protocolo: { id: string } };
  }>;
};

export function DashboardProyectos({
  proyectos,
  protocolos,
}: {
  proyectos: Proyecto[];
  protocolos: Array<{ id: string; nombre: string }>;
}) {
  const [clienteId, setClienteId] = useState("todos");

  const clientes = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const p of proyectos) {
      vistos.set(p.cliente.id, p.cliente.nombre);
    }
    return [...vistos.entries()]
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [proyectos]);

  const filtrados = useMemo(() => {
    if (clienteId === "todos") return proyectos;
    return proyectos.filter((p) => p.cliente.id === clienteId);
  }, [proyectos, clienteId]);

  return (
    <div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Proyectos
        </h2>
        {clientes.length > 1 && (
          <Select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            aria-label="Filtrar proyectos por cliente"
            className="text-xs"
          >
            <option value="todos">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </div>

      {proyectos.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">
          Todavia no hay proyectos.{" "}
          <Link href="/proyectos" className="text-accent underline">
            Crear uno
          </Link>
          .
        </p>
      ) : filtrados.length === 0 ? (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <FolderKanban size={28} strokeWidth={1.5} className="text-text-muted" />
          <p className="text-sm text-text-muted">Este cliente no tiene proyectos.</p>
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtrados.map((proyecto) => {
            const pasosProyecto = proyecto.ejecucionesProtocolo.flatMap((e) => e.pasos);
            const progresoProyecto = contarProgreso(pasosProyecto);
            const proyectoCompleto =
              progresoProyecto.total > 0 && progresoProyecto.completos === progresoProyecto.total;
            const alerta = alertaFechaCompromiso(proyecto.fechaCompromiso, proyectoCompleto);

            return (
              <li key={proyecto.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar nombre={proyecto.cliente.nombre} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <SemaforoDot semaforo={calcularSemaforo(proyecto)} />
                          <Link
                            href={`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`}
                            className="truncate font-medium hover:text-accent"
                          >
                            {proyecto.nombre}
                          </Link>
                        </div>
                        <p className="truncate text-sm text-text-muted">{proyecto.cliente.nombre}</p>
                      </div>
                    </div>
                    <EtapaBadge
                      nombre={proyecto.etapaActual.nombre}
                      orden={proyecto.etapaActual.orden}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    {progresoProyecto.total > 0 ? (
                      <ProgressBar value={progresoProyecto.completos} max={progresoProyecto.total} />
                    ) : (
                      <span className="font-mono text-xs text-text-muted">
                        sin protocolos iniciados
                      </span>
                    )}
                    {alerta && <AlertaFechaBadge alerta={alerta} />}
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
                    {protocolos.map((protocolo) => {
                      const ejecucion = proyecto.ejecucionesProtocolo.find(
                        (e) => e.versionProtocolo.protocolo.id === protocolo.id,
                      );
                      const progreso = ejecucion ? contarProgreso(ejecucion.pasos) : null;

                      return (
                        <li key={protocolo.id} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-text-muted">{protocolo.nombre}</span>
                          {progreso ? (
                            <ProgressBar value={progreso.completos} max={progreso.total} />
                          ) : (
                            <span className="font-mono text-xs text-text-muted">sin iniciar</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
