// Next.js 16 no propaga el mensaje de errores lanzados (throw) desde Server
// Actions al cliente en produccion: solo llega un digest generico (React
// error #441). Las acciones que pueden fallar por motivos "esperados"
// (validacion, duplicados, permisos) deben devolver este tipo en vez de
// lanzar, para que el mensaje real le llegue al usuario.
//
// El discriminante es el literal `ok`, no un campo opcional-undefined: eso
// es lo que le permite a TypeScript angostar `result.data` / `result.error`
// de forma confiable despues de un `if (!result.ok)`.
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}
