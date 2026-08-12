# Propuestas de mejora — RCD OS

Documento vivo: nació como lista de propuestas y ahora refleja lo que ya se implementó en las sesiones siguientes (todo excepto lo que depende de JIRA, por decisión explícita: **esta plataforma no integra JIRA**). Se apoya en dos fuentes: el estado real del código (`app/`, `prisma/schema.prisma`) y la visión declarada en `RCD-OS-Roadmap.md`.

---

## Implementado

**UX/UI**
- Nav mobile con menú hamburguesa (`Sidebar.tsx` ya no se corta en pantallas chicas)
- Loading skeletons por vista (`loading.tsx` en dashboard/proyectos/protocolos/clientes)
- Sistema de toast + confirmación de guardado en el checklist de ejecución
- Breadcrumbs en detalle de protocolo, detalle de proyecto y checklist de ejecución
- Buscador client-side en `/proyectos`, `/protocolos` y `/clientes`
- Estados vacíos consistentes (ícono + texto) en las 3 listas
- `aria-label`/`aria-expanded` en los botones de solo-ícono
- Filtro de dashboard por cliente

**Funcionalidad**
- **Semáforo verde/amarillo/rojo** (`lib/proyectos/semaforo.ts`) — con reglas propias, **sin JIRA**: se calcula a partir de `fechaCompromiso` del proyecto y `fechaLimite` de cada ejecución de protocolo activa. No es la regla original del roadmap (que dependía de inactividad en JIRA y prioridad de tareas ahí); es una decisión de producto tomada sin validar con el equipo — revisar si calza con cómo trabajan.
- **UI de Roles** (`/roles`) — asignar titular/reemplazo por rol, algo que antes solo era editable directo en la base de datos.
- **Entidad `Solicitud`** (`/solicitudes`) — flujo interno formulario → rol responsable → estado, sin integración a JIRA (se descartó esa parte a propósito).
- **`EventoAuditoria`** (`/auditoria`) — log append-only, conectado a los cambios de etapa de proyecto, cambios de paso, creación de protocolo/proyecto/cliente/solicitud y nuevas versiones de protocolo.
- **Comentarios por paso** — historial con autor y fecha, además del campo `notas` (que se sigue sobreescribiendo, sin cambios).
- **Adjuntar archivo real** — bucket privado de Supabase Storage (`evidencia`), con URLs firmadas al vuelo. El campo `evidencia_url` sigue siendo texto libre; un archivo subido se guarda como `storage:<path>` para distinguirlo de un link externo pegado a mano.
- **Centro de alertas in-app** (`/alertas`) — sustituto de notificaciones Slack/correo mientras no haya credenciales de un canal externo: agrupa proyectos en semáforo amarillo/rojo y solicitudes por vencer.
- **Exportar checklist a PDF** — vista imprimible dedicada (`.../imprimir`) + `window.print()`, sin librería nueva.
- **Editar un protocolo publicado** — ahora crea una v2 nueva en vez de mutar la vigente (coherente con el versionado que ya existía para proteger ejecuciones en curso).
- Contenido borrador para 2 protocolos que no existían (**Creación de ambientes**, **Cookies y protección de datos**) y el checklist de **Seguridad WordPress**, que estaba sembrado con 0 pasos — ahora tiene ~24 ítems de hardening estándar de industria. Es un borrador, no el contenido real del xlsx interno que menciona el roadmap — reemplazar cuando se migre.
- Descripciones para los 14 ítems de "Elementos básicos de sitio web" (ver sesión anterior).

**Corrección a este documento**: la versión anterior decía que no había RLS en Supabase. Eso era un error mío — RLS ya estaba habilitado desde antes (`EjecucionProtocolo`, `EjecucionPaso`) con policies simples de "cualquier autenticado lee/escribe". Las tablas nuevas (`Solicitud`, `Comentario`, `EventoAuditoria`, el bucket `evidencia`) siguen ese mismo criterio — `EventoAuditoria` además no tiene policy de `UPDATE`/`DELETE`, para que el append-only se cumpla a nivel de base de datos, no solo por convención en el código.

---

## Sigue pendiente

**Depende de JIRA (fuera de alcance por decisión del equipo)**
- Sync de proyectos/issues desde JIRA
- Semáforo con las reglas *originales* del roadmap (inactividad en JIRA, prioridad `Highest`)
- Creación automática de issues en JIRA desde un protocolo/checklist

**Depende de credenciales externas que no están en `.env`**
- Notificaciones reales por Slack/correo (el centro de alertas in-app es el sustituto mientras tanto)

**Vale la pena revisar con el equipo**
- El contenido borrador de Seguridad WordPress / Creación de ambientes / Cookies — son buenas prácticas genéricas, no el criterio específico de RCD
- Las reglas del semáforo propio (¿7 días para pasar a amarillo es el número correcto?)
- Probar la nav mobile en un dispositivo real, no solo en devtools
- La tensión entre "diseño minimalista, sin decoración" (roadmap §6) y la dirección visual más rica que se tomó en estas sesiones — sigue sin resolverse en el documento del roadmap
