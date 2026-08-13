"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Evento = {
  createdAt: Date;
  entidad: string;
  entidadId: string;
  accion: string;
  detalle: unknown;
  usuario: { nombre: string | null; email: string } | null;
};

function celdaCsv(valor: string): string {
  // RFC 4180: si el valor tiene coma, comilla o salto de linea, va entre
  // comillas dobles, y las comillas internas se escapan duplicandolas.
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export function ExportarCsvButton({ eventos }: { eventos: Evento[] }) {
  function exportar() {
    const encabezado = ["Fecha", "Entidad", "ID entidad", "Acción", "Usuario", "Detalle"];
    const filas = eventos.map((evento) => [
      evento.createdAt.toLocaleString("es-CL"),
      evento.entidad,
      evento.entidadId,
      evento.accion,
      evento.usuario?.nombre ?? evento.usuario?.email ?? "sistema",
      evento.detalle ? JSON.stringify(evento.detalle) : "",
    ]);

    const csv = [encabezado, ...filas]
      .map((fila) => fila.map(celdaCsv).join(","))
      .join("\r\n");

    // BOM al inicio para que Excel detecte UTF-8 y no rompa las tildes.
    const bom = String.fromCharCode(0xfeff);
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" onClick={exportar}>
      <Download size={14} strokeWidth={2} />
      Exportar CSV
    </Button>
  );
}
