"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, ChevronDown, CircleDashed, MinusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { variantParaEstado } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { esEstadoTerminal } from "@/lib/protocolos/estados";
import { AdjuntosPaso } from "./AdjuntosPaso";

// Color inline (no clase) para el borde izquierdo: si dependiera de una
// utilidad Tailwind, competiria en cascada con el "border-border" base de
// Card y el orden de aplicacion no estaria garantizado.
const BORDE_COLOR_POR_VARIANTE = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  neutral: "var(--color-neutral-badge)",
} as const;

const ICONO_POR_VARIANTE = {
  success: CheckCircle2,
  warning: CircleDashed,
  neutral: MinusCircle,
} as const;

export function EjecucionPasoRow({
  paso,
  estadosValidos,
}: {
  paso: {
    id: string;
    pasoNombre: string;
    estado: string;
    notas: string | null;
    evidenciaUrl: string | null;
    evidencias: Array<{ id: string; valor: string }>;
    fechaEjecucion: Date | null;
    responsable: { nombre: string | null; email: string } | null;
    comentarios: Array<{
      id: string;
      texto: string;
      createdAt: Date;
      autor: { nombre: string | null; email: string };
    }>;
  };
  estadosValidos: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [estado, setEstado] = useState(paso.estado);
  const [notas, setNotas] = useState(paso.notas ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  // null = seguir la regla por defecto (colapsado si el estado es terminal);
  // true/false = el usuario forzo el toggle a mano.
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null);

  const terminal = esEstadoTerminal(estado);
  const expanded = expandedOverride ?? !terminal;
  const variante = variantParaEstado(estado);
  const Icono = ICONO_POR_VARIANTE[variante];
  const puedeMarcarCompleto = !terminal && estadosValidos.includes("Completo");

  async function guardar(cambios: Partial<{ estado: string; notas: string; evidenciaUrl: string }>) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/ejecucion-paso/${paso.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambios),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const mensaje = data?.error ?? "No se pudo guardar el cambio";
        setError(mensaje);
        showToast(mensaje, "error");
        return;
      }

      showToast("Guardado");
      router.refresh();
    } catch {
      const mensaje = "Ocurrio un error inesperado, intenta de nuevo";
      setError(mensaje);
      showToast(mensaje, "error");
    } finally {
      setSaving(false);
    }
  }

  async function enviarComentario() {
    const texto = nuevoComentario.trim();
    if (!texto) return;

    setEnviandoComentario(true);
    try {
      const res = await fetch(`/api/ejecucion-paso/${paso.id}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error ?? "No se pudo agregar el comentario", "error");
        return;
      }

      setNuevoComentario("");
      router.refresh();
    } catch {
      showToast("Ocurrio un error inesperado, intenta de nuevo", "error");
    } finally {
      setEnviandoComentario(false);
    }
  }

  return (
    <Card as="li" className="border-l-4" style={{ borderLeftColor: BORDE_COLOR_POR_VARIANTE[variante] }}>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setExpandedOverride(!expanded)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <Icono size={18} strokeWidth={2} className="shrink-0 text-text-muted" />
          <p className={`truncate font-medium ${terminal ? "text-text-muted" : "text-text"}`}>
            {paso.pasoNombre}
          </p>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={`shrink-0 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {puedeMarcarCompleto && (
            <Button
              type="button"
              variant="success"
              disabled={saving}
              onClick={() => {
                setEstado("Completo");
                guardar({ estado: "Completo" });
              }}
              className="px-2.5 py-1.5 text-xs"
            >
              <CheckCircle2 size={14} strokeWidth={2} />
              Completar
            </Button>
          )}
          <Select
            value={estado}
            disabled={saving}
            onChange={(e) => {
              const nuevoEstado = e.target.value;
              setEstado(nuevoEstado);
              guardar({ estado: nuevoEstado });
            }}
          >
            {estadosValidos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {expanded && (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <AdjuntosPaso
              pasoId={paso.id}
              evidencias={paso.evidencias}
              evidenciaLegacy={paso.evidenciaUrl}
              disabled={saving}
              onQuitarLegacy={() => guardar({ evidenciaUrl: "" })}
              onCambio={() => router.refresh()}
            />
            <Input
              type="text"
              placeholder="Notas (opcional)"
              value={notas}
              disabled={saving}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => guardar({ notas })}
            />
          </div>

          {paso.fechaEjecucion && (
            <p className="mt-2 font-mono text-xs text-text-muted">
              Marcado por {paso.responsable?.nombre ?? paso.responsable?.email ?? "?"} el{" "}
              {new Date(paso.fechaEjecucion).toLocaleDateString("es-CL")}
            </p>
          )}

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Comentarios{paso.comentarios.length > 0 ? ` (${paso.comentarios.length})` : ""}
            </p>

            {paso.comentarios.length > 0 && (
              <ul className="mt-2 space-y-2">
                {paso.comentarios.map((comentario) => (
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
        </>
      )}
    </Card>
  );
}
