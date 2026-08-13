// Limitador basico en memoria (fixed window), por instancia de funcion.
// Fluid Compute reutiliza instancias entre invocaciones (no es
// una-instancia-por-request como el serverless tradicional), asi que este
// Map efectivamente sobrevive entre requests seguidos del mismo usuario en
// la practica, aunque no es un limite distribuido/exacto entre instancias.
// Suficiente como primera barrera contra un cliente que llama en loop; para
// un limite estricto multi-instancia haria falta un store compartido
// (ej. Upstash Redis via Vercel Marketplace).
type Entrada = { count: number; resetAt: number };

const buckets = new Map<string, Entrada>();

export function rateLimit(
  key: string,
  limite: number,
  ventanaMs: number,
): { permitido: boolean; reintentarEnMs: number } {
  const ahora = Date.now();
  const entrada = buckets.get(key);

  if (!entrada || entrada.resetAt <= ahora) {
    buckets.set(key, { count: 1, resetAt: ahora + ventanaMs });
    return { permitido: true, reintentarEnMs: 0 };
  }

  if (entrada.count >= limite) {
    return { permitido: false, reintentarEnMs: entrada.resetAt - ahora };
  }

  entrada.count++;
  return { permitido: true, reintentarEnMs: 0 };
}

export function respuestaLimiteExcedido(reintentarEnMs: number) {
  return Response.json(
    { error: "Demasiadas solicitudes, esperá un momento" },
    { status: 429, headers: { "Retry-After": String(Math.ceil(reintentarEnMs / 1000)) } },
  );
}
