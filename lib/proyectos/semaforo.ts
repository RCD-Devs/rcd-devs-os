// Semaforo del proyecto (RCD-OS-Roadmap.md #3). El roadmap original define
// "rojo" en parte por inactividad en JIRA y prioridad de tareas ahi — esta
// plataforma no integra JIRA, asi que la regla se redefine usando solo datos
// que existen en este schema: fecha de compromiso del proyecto y fecha
// limite de cada ejecucion de protocolo activa. Es una decision de producto
// tomada sin validar con el equipo; ajustar si no calza con como trabajan.

export type Semaforo = "verde" | "amarillo" | "rojo";

const MS_DIA = 86400000;

function diasHasta(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / MS_DIA);
}

export function calcularSemaforo(proyecto: {
  fechaCompromiso: Date | null;
  ejecucionesProtocolo: Array<{ estado: string; fechaLimite: Date | null }>;
}): Semaforo {
  const fechasRelevantes: Date[] = [];

  if (proyecto.fechaCompromiso) {
    fechasRelevantes.push(proyecto.fechaCompromiso);
  }
  for (const ejecucion of proyecto.ejecucionesProtocolo) {
    if (ejecucion.estado !== "Completo" && ejecucion.fechaLimite) {
      fechasRelevantes.push(ejecucion.fechaLimite);
    }
  }

  if (fechasRelevantes.length === 0) {
    return "verde";
  }

  const diasMinimos = Math.min(...fechasRelevantes.map(diasHasta));

  if (diasMinimos < 0) return "rojo";
  if (diasMinimos <= 7) return "amarillo";
  return "verde";
}

export const SEMAFORO_LABEL: Record<Semaforo, string> = {
  verde: "Sin plazos en riesgo",
  amarillo: "Plazo proximo (≤7 dias)",
  rojo: "Plazo vencido",
};

export const SEMAFORO_DOT_CLASS: Record<Semaforo, string> = {
  verde: "bg-success",
  amarillo: "bg-warning",
  rojo: "bg-chart-5",
};
