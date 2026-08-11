# Spec: Protocolos

**Fecha:** 2026-08-11
**Estado:** Aprobado — pendiente de plan de implementación

## Contexto

El spec de [Login/Auth](./2026-08-10-login-auth-design.md) está aprobado y define la base de sesión/identidad sobre la que corre todo lo demás. Este es el segundo spec de construcción: el módulo de Protocolos, el núcleo funcional de RCD OS según el roadmap (§4: "RCD OS es un aplicativo tipo plantilla con checklist estructurado, NO un gestor documental").

**Decisión de alcance para este spec:** se deja fuera la capa de integración con JIRA (sync de proyectos/issues, `IssueJiraCache`, webhooks). RCD OS gestiona `Proyecto` de forma autónoma por ahora — la integración JIRA queda pendiente para un spec futuro si se retoma.

Referencias del roadmap: §1 (ciclo de vida de proyecto y gates), §4 (biblioteca de protocolos, con detalle de checklist en §4.1 y §4.2), §5 (modelo de datos).

## Decisiones tomadas en brainstorming

- **Alcance de protocolos en este spec:** se siembran los dos protocolos que ya tienen checklist definido en el roadmap — **Seguridad WordPress** (~55 pasos, §4.2) y **Elementos básicos de sitio web** (14 pasos, §4.1). "Creación de ambientes" queda fuera porque su checklist todavía no está redactado (pendiente en Fase 0 del roadmap); se agrega más adelante sin cambios de schema, porque el modelo de pasos es genérico (JSON).
- **Permisos de ejecución:** cualquier usuario autenticado puede marcar cualquier paso de cualquier checklist, sin restricción por `responsable_id` ni por rol. Consistente con que la lógica de permisos por rol sigue sin construirse (diferida desde el spec de Auth, que dijo explícitamente que se diseñaría "junto con Protocolos" — esta es esa decisión: por ahora, no hay gate de permiso). `responsable_id` se guarda como dato informativo de quién ejecutó el paso, no como control de acceso.
- **Evidencia:** `evidencia_url` es siempre opcional, en todos los protocolos y pasos. Se puede adjuntar pero nunca bloquea marcar un paso como completo/implementado/no aplica.
- **Etapa de proyecto sin JIRA:** `Proyecto.etapa_actual` se actualiza manualmente vía un selector en la vista de proyecto. Cualquier usuario autenticado puede cambiarla — misma lógica sin restricción de rol que el resto del spec. El gate de salida de cada etapa (roadmap §1) **no se valida automáticamente** en este spec: confirmar que se cumplió es responsabilidad humana, no del sistema.
- **JIRA fuera de alcance:** no se construye `IssueJiraCache`, sync ni vínculo `Solicitud → issue de JIRA`. `jira_project_key` se elimina del modelo `Proyecto` para este spec (se puede reintroducir sin fricción si se retoma la integración).

## Arquitectura

Next.js (App Router) + Prisma sobre la misma base Postgres de Supabase, protegido por el middleware de sesión ya definido en el spec de Auth (ninguna ruta de Protocolos es pública). RLS de Supabase habilitado en `EjecucionProtocolo` y `EjecucionPaso`: la política es "cualquier usuario con sesión válida puede leer/escribir" — RLS bloquea acceso anónimo/directo a la base, no diferencia roles todavía (no hay esa lógica en este spec).

Los pasos de un protocolo viven congelados en `VersionProtocolo.pasos_json` (la plantilla). Al iniciar la ejecución de un protocolo en un proyecto, se copian a filas `EjecucionPaso` (las instancias editables). Esto es lo que permite versionar protocolos sin romper ejecuciones ya iniciadas (roadmap: "un proyecto queda congelado a la versión de protocolo con la que partió").

Los estados válidos de un paso difieren por protocolo (roadmap §4.1 vs §4.2: `Pendiente/En curso/Completo/No aplica` vs `Implementado/Pendiente/No aplica`). Por eso `EjecucionPaso.estado` es un string validado en la capa de aplicación contra la lista de estados que trae `VersionProtocolo`, no un enum fijo de Postgres — así se agregan protocolos nuevos con estados distintos sin migración de schema.

## Modelo de datos (ajustado del roadmap §5, sin JIRA)

```
Cliente (id, nombre)
Etapa (id, nombre, orden, gate_descripcion)              -- catálogo fijo, seed de las 8 etapas oficiales (roadmap §1)
Proyecto (id, cliente_id, nombre, etapa_actual, fecha_inicio, fecha_compromiso)   -- sin jira_project_key

Protocolo (id, nombre, objetivo, alcance)
VersionProtocolo (id, protocolo_id, numero_version, fecha_publicacion, pasos_json, estados_json)
EjecucionProtocolo (id, proyecto_id, version_protocolo_id, estado, fecha_limite)
EjecucionPaso (id, ejecucion_id, paso_nombre, estado, responsable_id, evidencia_url, fecha_ejecucion, notas)
```

`estados_json` es nuevo respecto al roadmap original: lista ordenada de los estados válidos para esa versión del protocolo (ej. `["Pendiente","En curso","Completo","No aplica"]`), usada para validar transiciones y para saber cuáles son "terminales" (todo lo que no sea `Pendiente`/`En curso`).

## Componentes

| Componente | Responsabilidad |
|---|---|
| `app/protocolos/page.tsx` | Biblioteca de protocolos disponibles (los 2 sembrados: Seguridad WordPress, Elementos básicos). |
| `app/protocolos/[protocoloId]/page.tsx` | Detalle: objetivo, alcance, versión vigente y su checklist de referencia. |
| `app/proyectos/[proyectoId]/page.tsx` | Vista de proyecto: etapa actual (selector editable) + protocolos en ejecución/pendientes. |
| `app/proyectos/[proyectoId]/protocolos/[ejecucionId]/page.tsx` | Checklist de ejecución: cada `EjecucionPaso` con estado editable, notas, evidencia opcional. |
| `app/api/ejecucion-protocolo/route.ts` (POST) | Inicia una `EjecucionProtocolo` para un proyecto desde la `VersionProtocolo` vigente; genera las filas `EjecucionPaso` desde `pasos_json`. |
| `app/api/ejecucion-paso/[id]/route.ts` (PATCH) | Actualiza estado/notas/evidencia de un paso; valida el estado contra `estados_json`; recalcula `EjecucionProtocolo.estado` si corresponde. |
| `lib/protocolos/estados.ts` | Helper de validación de transición de estado y de cálculo de "¿la ejecución quedó completa?". |
| `prisma/schema.prisma` | Modelos `Cliente`, `Etapa`, `Proyecto`, `Protocolo`, `VersionProtocolo`, `EjecucionProtocolo`, `EjecucionPaso`. |
| `prisma/seed.ts` | Extiende el seed existente (roles) con: 8 etapas oficiales, los 2 protocolos + `VersionProtocolo` v1 con `pasos_json`/`estados_json` poblados desde roadmap §4.1 y §4.2. |

## Flujo de datos

1. Los protocolos y su versión v1 se cargan por seed (no hay UI de autoría en este spec).
2. Un usuario entra a un `Proyecto` y ejecuta "Iniciar protocolo X" → se crea `EjecucionProtocolo(estado='En curso')` + una fila `EjecucionPaso` por cada paso de `pasos_json`, con el primer estado de `estados_json` (ej. `Pendiente`).
3. Cualquier usuario autenticado abre el checklist y cambia el estado de cada `EjecucionPaso`, opcionalmente con notas/evidencia. `fecha_ejecucion` se autocompleta al pasar a un estado terminal.
4. Cuando todos los `EjecucionPaso` de una `EjecucionProtocolo` quedan en estado terminal, `EjecucionProtocolo.estado` pasa a `Completo` automáticamente — calculado, no declarado (mismo principio que el semáforo del roadmap §3).
5. La etapa del proyecto se cambia manualmente desde el selector en `app/proyectos/[proyectoId]/page.tsx`, independiente del estado de los protocolos (el gate es responsabilidad humana en este spec).

## Manejo de errores

- Iniciar una `EjecucionProtocolo` para un proyecto que ya tiene una activa del mismo protocolo → rechazado con mensaje claro (evita checklists paralelos duplicados y confusos).
- Estado enviado en el PATCH que no está en `estados_json` de esa versión → 400 con mensaje explícito.
- Falla al subir evidencia a Supabase Storage → no bloquea guardar el cambio de estado (la evidencia es opcional); se muestra el error de subida por separado.

## Testing

QA manual: sembrar los 2 protocolos → iniciar ejecución en un proyecto de prueba → marcar pasos en distintos estados, incluido "No aplica" → verificar que `EjecucionProtocolo` pasa a `Completo` automáticamente al terminar todos los pasos → verificar que cambiar la etapa del proyecto no depende de que haya protocolos completos → verificar que no se puede iniciar una segunda ejecución activa del mismo protocolo en el mismo proyecto.

No se prioriza test automatizado más allá de un test unitario opcional de `lib/protocolos/estados.ts` (validación de transición y cálculo de completitud son lógica pura, fácil de testear sin mocks pesados).

## Fuera de alcance (explícitamente)

- Integración con JIRA (sync, `IssueJiraCache`, `Solicitud` → issue) — se retoma en spec futuro si se decide.
- Lógica de permisos/autorización por rol — cualquier usuario autenticado puede todo dentro de Protocolos, según lo decidido en brainstorming.
- Validación automática del gate de etapa (roadmap §1) — el cambio de etapa es manual, el sistema no verifica que el gate se cumplió.
- UI de administración para crear/editar protocolos y versiones nuevas — se cargan por seed en este spec.
- Protocolo "Creación de ambientes" — checklist no redactado todavía (pendiente Fase 0 del roadmap); se agrega en iteración futura sin cambios de schema.
- Alertas automáticas ligadas a `fecha_limite` de `EjecucionProtocolo` — fase 2 del roadmap.
- Módulo `Solicitud` (formulario → asignación a rol → estado) — no forma parte de este spec.

## Siguiente paso

Plan de implementación: desglose de tareas, orden de migraciones Prisma (Auth ya definió `Usuario`/`Rol`; este spec agrega el resto del modelo), y breakdown de PRs siguiendo la convención de `CONTRIBUTING.md` (rama sugerida: `feature/protocolos-checklist`).
