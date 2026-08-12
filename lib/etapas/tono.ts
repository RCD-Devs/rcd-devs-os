import type { Tone } from "@/lib/ui/tone";

// Progresion cromatica fija para las 8 etapas oficiales del roadmap (frio en
// el inicio, calido en el cierre). Por orden, no por hash: el orden importa
// para que el color comunique avance real en el ciclo de vida.
const TONO_POR_ORDEN: Record<number, Tone> = {
  1: 1, // Preinicio
  2: 1, // Kickoff
  3: 2, // Preparacion tecnica
  4: 2, // Diseño / definicion funcional
  5: 3, // Desarrollo
  6: 4, // QA
  7: 4, // Paso a produccion
  8: 5, // Entrega y cierre
};

export function tonoPorEtapa(orden: number): Tone {
  return TONO_POR_ORDEN[orden] ?? 1;
}
