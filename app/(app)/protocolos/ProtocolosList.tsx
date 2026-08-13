"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList, FolderKanban, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Paginacion } from "@/components/ui/Paginacion";
import { iconoProtocolo } from "@/lib/protocolos/icono";
import { slugify } from "@/lib/slug";
import { TONE_BG_TEXT, toneFromString } from "@/lib/ui/tone";

type ProtocoloResumen = {
  id: string;
  nombre: string;
  objetivo: string;
  numeroVersion: number | null;
  pasosCount: number;
  nProyectos: number;
  nEjecuciones: number;
};

const TAMANO_PAGINA = 20;

export function ProtocolosList({ protocolos }: { protocolos: ProtocoloResumen[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return protocolos;
    return protocolos.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.objetivo.toLowerCase().includes(q),
    );
  }, [protocolos, busqueda]);

  const [busquedaAnterior, setBusquedaAnterior] = useState(busqueda);
  if (busqueda !== busquedaAnterior) {
    setBusquedaAnterior(busqueda);
    setPagina(1);
  }

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA));
  const visibles = filtrados.slice((pagina - 1) * TAMANO_PAGINA, pagina * TAMANO_PAGINA);

  return (
    <div>
      <div className="relative mb-6">
        <Search
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
        />
        <Input
          type="text"
          placeholder="Buscar protocolo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
          aria-label="Buscar protocolo"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <ClipboardList size={28} strokeWidth={1.5} className="text-text-muted" />
          <p className="text-sm text-text-muted">
            {protocolos.length === 0
              ? "Todavia no hay protocolos."
              : "Ningun protocolo coincide con la busqueda."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibles.map((protocolo) => {
            const Icono = iconoProtocolo(protocolo.id);
            const tone = toneFromString(protocolo.id);

            return (
              <li key={protocolo.id}>
                <Link href={`/protocolos/${slugify(protocolo.nombre)}`}>
                  <Card className="flex h-full flex-col transition-colors hover:border-accent">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${TONE_BG_TEXT[tone]}`}
                        >
                          <Icono size={20} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{protocolo.nombre}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                            {protocolo.objetivo}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE_BG_TEXT[tone]}`}
                        title="Proyectos que aplican este protocolo"
                      >
                        <FolderKanban size={13} strokeWidth={2} />
                        {protocolo.nProyectos}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-text-muted">
                      <span className="font-mono">v{protocolo.numeroVersion ?? "-"}</span>
                      <span>{protocolo.pasosCount} pasos</span>
                      <span>
                        {protocolo.nEjecuciones} ejecucion{protocolo.nEjecuciones === 1 ? "" : "es"}
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </div>
  );
}
