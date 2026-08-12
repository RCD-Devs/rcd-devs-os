"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FolderKanban, Search } from "lucide-react";
import { AlertaFechaBadge } from "@/components/ui/AlertaFechaBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EtapaBadge } from "@/components/ui/EtapaBadge";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { contarProgreso } from "@/lib/protocolos/estados";
import { alertaFechaCompromiso } from "@/lib/proyectos/alertaFecha";
import { calcularSemaforo } from "@/lib/proyectos/semaforo";
import { slugConId } from "@/lib/slug";

type Proyecto = {
  id: string;
  nombre: string;
  fechaCompromiso: Date | null;
  cliente: { nombre: string };
  etapaActual: { nombre: string; orden: number };
  ejecucionesProtocolo: Array<{
    estado: string;
    fechaLimite: Date | null;
    pasos: Array<{ estado: string }>;
  }>;
};

export function ProyectosList({ proyectos }: { proyectos: Proyecto[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return proyectos;
    return proyectos.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.cliente.nombre.toLowerCase().includes(q),
    );
  }, [proyectos, busqueda]);

  return (
    <div>
      <div className="relative mt-6">
        <Search
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
        />
        <Input
          type="text"
          placeholder="Buscar proyecto o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
          aria-label="Buscar proyecto"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <FolderKanban size={28} strokeWidth={1.5} className="text-text-muted" />
          <p className="text-sm text-text-muted">
            {proyectos.length === 0
              ? "Todavia no hay proyectos."
              : "Ningun proyecto coincide con la busqueda."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtrados.map((proyecto) => {
            const pasos = proyecto.ejecucionesProtocolo.flatMap((e) => e.pasos);
            const progreso = contarProgreso(pasos);
            const proyectoCompleto = progreso.total > 0 && progreso.completos === progreso.total;
            const alerta = alertaFechaCompromiso(proyecto.fechaCompromiso, proyectoCompleto);

            return (
              <li key={proyecto.id}>
                <Link href={`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`}>
                  <Card className="flex h-full flex-col transition-colors hover:border-accent">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar nombre={proyecto.cliente.nombre} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <SemaforoDot semaforo={calcularSemaforo(proyecto)} />
                            <p className="truncate font-medium">{proyecto.nombre}</p>
                          </div>
                          <p className="truncate text-sm text-text-muted">
                            {proyecto.cliente.nombre}
                          </p>
                        </div>
                      </div>
                      <EtapaBadge
                        nombre={proyecto.etapaActual.nombre}
                        orden={proyecto.etapaActual.orden}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      {progreso.total > 0 ? (
                        <ProgressBar value={progreso.completos} max={progreso.total} />
                      ) : (
                        <span className="font-mono text-xs text-text-muted">
                          sin protocolos iniciados
                        </span>
                      )}
                      {alerta && <AlertaFechaBadge alerta={alerta} />}
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
