import { tonoPorEtapa } from "@/lib/etapas/tono";
import { TONE_BG_TEXT } from "@/lib/ui/tone";

export function EtapaBadge({ nombre, orden }: { nombre: string; orden: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_BG_TEXT[tonoPorEtapa(orden)]}`}
    >
      {nombre}
    </span>
  );
}
