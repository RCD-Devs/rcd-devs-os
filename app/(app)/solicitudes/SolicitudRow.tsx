"use client";

import { useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { actualizarEstadoSolicitud, agregarComentarioSolicitud } from "./actions";
import { ESTADOS_SOLICITUD } from "./estados";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const BADGE_POR_ESTADO: Record<string, string> = {
  Pendiente: "bg-neutral-badge-bg text-neutral-badge",
  "En curso": "bg-warning-bg text-warning",
  Resuelta: "bg-success-bg text-success",
  Rechazada: "bg-chart-5-bg text-chart-5",
};

export function SolicitudRow({
  solicitud,
}: {
  solicitud: {
    id: string;
    tipo: string;
    descripcion: string | null;
    estado: string;
    slaFechaLimite: Date | null;
    proyecto: { nombre: string };
    responsableRol: { nombre: string };
    solicitante: { nombre: string | null; email: string };
    comentarios: Array<{
      id: string;
      texto: string;
      createdAt: Date;
      autor: { nombre: string | null; email: string };
    }>;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [expandido, setExpandido] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  function enviarComentario() {
    const texto = nuevoComentario.trim();
    if (!texto) return;

    setEnviandoComentario(true);
    startTransition(async () => {
      const result = await agregarComentarioSolicitud(solicitud.id, texto);
      setEnviandoComentario(false);
      if (!result.ok) {
        showToast(result.error, "error");
      } else {
        setNuevoComentario("");
      }
    });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{solicitud.tipo}</p>
          <p className="text-sm text-text-muted">
            {solicitud.proyecto.nombre} · responsable: {solicitud.responsableRol.nombre}
          </p>
          {solicitud.descripcion && (
            <p className="mt-1 text-sm text-text-muted">{solicitud.descripcion}</p>
          )}
          <p className="mt-1 font-mono text-xs text-text-muted">
            Solicitado por {solicitud.solicitante.nombre ?? solicitud.solicitante.email}
            {solicitud.slaFechaLimite &&
              ` · limite ${new Date(solicitud.slaFechaLimite).toLocaleDateString("es-CL")}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${BADGE_POR_ESTADO[solicitud.estado] ?? BADGE_POR_ESTADO.Pendiente}`}
          >
            {solicitud.estado}
          </span>
          <Select
            value={solicitud.estado}
            disabled={isPending}
            onChange={(e) => {
              const estado = e.target.value;
              startTransition(async () => {
                const result = await actualizarEstadoSolicitud(solicitud.id, estado);
                if (!result.ok) {
                  showToast(result.error, "error");
                } else {
                  showToast("Estado actualizado");
                }
              });
            }}
          >
            {ESTADOS_SOLICITUD.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
      >
        <MessageSquare size={13} strokeWidth={2} />
        Comentarios{solicitud.comentarios.length > 0 ? ` (${solicitud.comentarios.length})` : ""}
      </button>

      {expandido && (
        <div className="mt-2 border-t border-border pt-3">
          {solicitud.comentarios.length > 0 && (
            <ul className="space-y-2">
              {solicitud.comentarios.map((comentario) => (
                <li key={comentario.id} className="text-sm">
                  <span className="font-medium">
                    {comentario.autor.nombre ?? comentario.autor.email}
                  </span>{" "}
                  <span className="font-mono text-xs text-text-muted">
                    {new Date(comentario.createdAt).toLocaleString("es-CL")}
                  </span>
                  <p className="text-text-muted">{comentario.texto}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Agregar un comentario..."
              value={nuevoComentario}
              disabled={enviandoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  enviarComentario();
                }
              }}
            />
            <Button
              type="button"
              disabled={enviandoComentario || !nuevoComentario.trim()}
              onClick={enviarComentario}
              className="shrink-0 px-3 py-2 text-xs"
            >
              Enviar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
