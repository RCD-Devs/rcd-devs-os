"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, FolderKanban, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Cliente = { id: string; nombre: string; _count: { proyectos: number } };

export function ClientesList({ clientes }: { clientes: Cliente[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [clientes, busqueda]);

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
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
          aria-label="Buscar cliente"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Building2 size={28} strokeWidth={1.5} className="text-text-muted" />
          <p className="text-sm text-text-muted">
            {clientes.length === 0 ? "Todavia no hay clientes." : "Ningun cliente coincide con la busqueda."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((cliente) => (
            <li key={cliente.id}>
              <Link href={`/clientes/${cliente.id}`}>
                <Card className="flex items-center gap-3 transition-colors hover:border-accent">
                  <Avatar nombre={cliente.nombre} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{cliente.nombre}</p>
                    <p className="flex items-center gap-1 text-xs text-text-muted">
                      <FolderKanban size={12} strokeWidth={2} />
                      {cliente._count.proyectos} proyecto{cliente._count.proyectos === 1 ? "" : "s"}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
