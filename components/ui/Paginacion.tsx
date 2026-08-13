"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Paginacion({
  pagina,
  totalPaginas,
  onCambiar,
}: {
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button
        type="button"
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina <= 1}
        className="px-2.5 py-1.5 text-xs"
      >
        <ChevronLeft size={14} strokeWidth={2} />
        Anterior
      </Button>
      <span className="font-mono text-xs text-text-muted">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        type="button"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className="px-2.5 py-1.5 text-xs"
      >
        Siguiente
        <ChevronRight size={14} strokeWidth={2} />
      </Button>
    </div>
  );
}
