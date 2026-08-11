// Terminal = cualquier estado que no sea Pendiente/En curso (spec de Protocolos).
// Es independiente de la lista de estados validos de cada version: algunos
// protocolos (ej. Seguridad WordPress) ni siquiera usan "En curso".
const ESTADOS_NO_TERMINALES = new Set(["Pendiente", "En curso"]);

export function esEstadoValido(estadosValidos: string[], estado: string): boolean {
  return estadosValidos.includes(estado);
}

export function esEstadoTerminal(estado: string): boolean {
  return !ESTADOS_NO_TERMINALES.has(estado);
}

export function calcularEstadoEjecucion(
  pasos: Array<{ estado: string }>,
): "Completo" | "En curso" {
  if (pasos.length === 0) {
    return "En curso";
  }

  return pasos.every((paso) => esEstadoTerminal(paso.estado)) ? "Completo" : "En curso";
}

export function contarProgreso(pasos: Array<{ estado: string }>): {
  completos: number;
  total: number;
} {
  return {
    completos: pasos.filter((paso) => esEstadoTerminal(paso.estado)).length,
    total: pasos.length,
  };
}
