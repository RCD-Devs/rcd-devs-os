const MS_DIA = 86400000;

export type AlertaFecha = { texto: string; tone: "vencido" | "proximo" };

// Solo alerta si el proyecto no esta ya completo: una fecha vencida en un
// proyecto cerrado no es informacion accionable.
export function alertaFechaCompromiso(
  fechaCompromiso: Date | null,
  proyectoCompleto: boolean,
): AlertaFecha | null {
  if (!fechaCompromiso || proyectoCompleto) {
    return null;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((fechaCompromiso.getTime() - hoy.getTime()) / MS_DIA);

  if (dias < 0) {
    return { texto: `Vencido hace ${Math.abs(dias)}d`, tone: "vencido" };
  }
  if (dias <= 7) {
    return { texto: dias === 0 ? "Vence hoy" : `Vence en ${dias}d`, tone: "proximo" };
  }
  return null;
}
