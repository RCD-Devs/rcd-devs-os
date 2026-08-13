# Propuestas de mejora — RCD OS

Documento vivo: nació como lista de propuestas y ahora refleja lo que ya se implementó en las sesiones siguientes (todo excepto lo que depende de JIRA, por decisión explícita: **esta plataforma no integra JIRA**). Se apoya en dos fuentes: el estado real del código (`app/`, `prisma/schema.prisma`) y la visión declarada en `RCD-OS-Roadmap.md`.

---

## Implementado

**UX/UI**
- Nav mobile con menú hamburguesa (`Sidebar.tsx` ya no se corta en pantallas chicas)
- Loading skeletons en todas las rutas (`loading.tsx`), no solo las 4 principales
- Sistema de toast + confirmación de guardado en el checklist de ejecución
- Breadcrumbs en detalle de protocolo, detalle de proyecto y checklist de ejecución
- Buscador client-side en `/proyectos`, `/protocolos` y `/clientes`
- Estados vacíos consistentes (ícono + texto) en las listas
- `aria-label`/`aria-expanded` en los botones de solo-ícono
- Filtro de dashboard por cliente
- **Modo oscuro con toggle manual** (`ThemeToggle.tsx` en el sidebar) — Automático/Claro/Oscuro independiente de la preferencia del SO, sin flash al cargar

**Funcionalidad**
- **Semáforo verde/amarillo/rojo** (`lib/proyectos/semaforo.ts`) — reglas propias, **sin JIRA**: se calcula a partir de `fechaCompromiso` del proyecto y `fechaLimite` de cada ejecución de protocolo activa.
- **UI de Roles** (`/roles`) — asignar titular/reemplazo y alternar acceso admin por rol.
- **Sistema de permisos por rol** (`Rol.esAdmin`) — Líder técnico y Director/a con control total (incluye `/roles` y `/usuarios`); el resto de los roles con CRUD completo sobre lo operativo (Protocolos, Proyectos, Clientes, Solicitudes) pero sin ver la configuración de permisos. Guard server-side en página y en cada server action, no solo ocultar el link.
- **Matriz de permisos granular** (`RolPermiso`) — lista de excepciones por rol/recurso/acción (ej. el rol "Diseño" no puede crear protocolos, aunque el resto de los roles no-admin sí). Eliminar Clientes/Proyectos quedó admin-only parejo para todos los roles (no había ningún "eliminar" en la app hasta ahora).
- **Rol "Diseño"** agregado al catálogo, con esa restricción de ejemplo ya sembrada.
- **Cliente con más datos** — contacto (nombre/email/teléfono), rubro, sitio web y notas internas; página de detalle/edición en `/clientes/[id]`.
- **Sección Perfil** (`/perfil`) — editar el propio nombre; el saludo del dashboard usa el nombre en vez de caer al correo.
- **Vista de Usuarios** (`/usuarios`, admin-only) — lista de cuentas con su rol, reasignación de rol por usuario. El formulario de invitación queda condicionado a que exista `SUPABASE_SERVICE_ROLE_KEY` en el entorno (ver pendientes).
- **Entidad `Solicitud`** (`/solicitudes`) — flujo interno formulario → rol responsable → estado, sin integración a JIRA.
- **`EventoAuditoria`** (`/auditoria`) — log append-only conectado a los cambios de etapa, paso, creación de protocolo/proyecto/cliente/solicitud/usuario y nuevas versiones de protocolo.
- **Comentarios por paso** — historial con autor y fecha, además del campo `notas`.
- **Adjuntar archivo real** — bucket privado de Supabase Storage (`evidencia`), URLs firmadas al vuelo.
- **Centro de alertas in-app** (`/alertas`) — agrupa proyectos en semáforo amarillo/rojo y solicitudes por vencer.
- **Exportar checklist a PDF** — vista imprimible dedicada + `window.print()`.
- **Editar un protocolo publicado** — crea una v2 nueva en vez de mutar la vigente.
- Contenido borrador para **Seguridad WordPress** (~24 ítems), **Creación de ambientes** y **Cookies y protección de datos** — borradores de industria, no el contenido real del xlsx interno del roadmap.
- Descripciones para los 14 ítems de "Elementos básicos de sitio web".

- **Gestión completa de usuarios desde `/usuarios`** — crear cuenta directo con email + contraseña temporal (`auth.admin.createUser`, sin depender de que Supabase logre entregar un email de invitación), editar correo, restablecer contraseña y eliminar cuenta, todo admin-only y sin salir de la app.
- **`/auditoria` restringida a admin** — antes cualquier usuario autenticado podía verla; ahora sigue el mismo criterio que `/usuarios` y `/roles`.
- **Cliente con nombre único** — constraint `UNIQUE` en `Cliente.nombre` a nivel de base de datos (antes se podían crear duplicados exactos sin aviso); mensaje de error claro al intentarlo.
- **Confirmación antes de acciones destructivas** (`ConfirmDeleteButton`) — eliminar cliente, proyecto o usuario pide un segundo click explícito en vez de un modal nativo `confirm()` o un botón directo.

**Infraestructura / deploy**
- **Migración a Prisma Driver Adapters** (`@prisma/adapter-pg` + `engineType: "client"`) — el deploy en Vercel fallaba en producción (`PrismaClientInitializationError`, motor nativo no encontrado) pese a tres intentos de configurar correctamente el empaquetado del binario. La solución fue eliminar la dependencia del binario nativo: Prisma ahora usa el driver `pg` en JS puro.
- **Región de las funciones de Vercel alineada con Supabase** — las funciones corrían en `iad1` (EE.UU., costa este) mientras la base está en `sa-east-1` (São Paulo); cada query cruzaba el continente. Cambiado a `gru1` (São Paulo). Esto explica gran parte del delay de navegación reportado — revisar si con Fluid Compute + región correcta se siente suficientemente rápido antes de invertir en más optimización (ver pendientes).
- **Mensajes de error de Server Actions reparados en producción** — Next.js 16 no propaga el `throw new Error(...)` de una Server Action al cliente en producción (solo llega un digest genérico, "Minified React error #441"); rompía en silencio *todos* los mensajes de validación/permiso/duplicado de la app, y solo se notaba en `next dev`. Las 9 Server Actions del proyecto ahora devuelven `{ ok, data } / { ok: false, error }` (`lib/actionResult.ts`) en vez de lanzar.

**Corrección a este documento**: la versión anterior decía que no había RLS en Supabase. Eso era un error — RLS ya estaba habilitado desde antes (`EjecucionProtocolo`, `EjecucionPaso`) con policies de "cualquier autenticado lee/escribe". Las tablas nuevas siguen ese mismo criterio; `EventoAuditoria` además no tiene policy de `UPDATE`/`DELETE`, para que el append-only se cumpla a nivel de base de datos.

---

## Sigue pendiente

**Depende de JIRA (fuera de alcance por decisión del equipo)**
- Sync de proyectos/issues desde JIRA
- Semáforo con las reglas *originales* del roadmap (inactividad en JIRA, prioridad `Highest`)
- Creación automática de issues en JIRA desde un protocolo/checklist

**Depende de credenciales externas que no están en `.env`**
- Notificaciones reales por correo (el centro de alertas in-app es el sustituto mientras tanto) — necesita elegir un proveedor (Resend, SMTP de Supabase, etc.)

**Vale la pena revisar con el equipo**
- El contenido borrador de Seguridad WordPress / Creación de ambientes / Cookies
- Las reglas del semáforo propio (¿7 días para pasar a amarillo es el número correcto?)
- Probar la nav mobile en un dispositivo real, no solo en devtools
- La tensión entre "diseño minimalista, sin decoración" (roadmap §6) y la dirección visual más rica que se tomó en estas sesiones

---

## Priorización por complejidad

Orden de ejecución (más simple primero): sin cambio de schema, sin dependencias nuevas y de pocos
archivos primero; lo que toca base de datos, agrega infraestructura externa o es más una decisión
de negocio que de código queda al final. Los números remiten a la lista de Recomendaciones de abajo.
Se va tildando a medida que se implementa.

**Tier 1 — trivial (config/doc, sin schema, sin deps nuevas)**
- [x] #3 Pantalla de error propia (`error.tsx`)
- [x] #25 Headers de seguridad HTTP básicos
- [x] #26 Documentar `SUPABASE_SERVICE_ROLE_KEY` (rotación, quién la generó)
- [x] #31 Revisar tamaño del connection pool de `pg`
- [x] #19 CI en GitHub Actions (typecheck + lint + build)
- [x] #20 README actualizado (estaba desincronizado: decía "Fase 0, sin código" y sin mencionar que JIRA quedó fuera de alcance)
- [x] #30 Habilitar Speed Insights / Web Analytics de Vercel

**Tier 2 — simple (una feature acotada, sin cambio de schema)**
- [x] #24 Validación de tamaño/tipo de archivo en el upload de evidencia
- [x] #18 Más tests unitarios en funciones puras (`slug.ts`, `actionResult.ts`) — el doc decía "ni un solo `.test.ts` en el repo", ya no era exacto (`lib/protocolos/estados.test.ts` existía). Sigue faltando cobertura de `lib/proyectos/semaforo.ts` y de la capa de Server Actions.
- [x] #4 Modo oscuro con toggle manual
- [x] #6 Onboarding para cuenta sin rol (mostrar titulares de Líder técnico/Director·a)
- [x] #33 Exportar auditoría a CSV
- [x] #28 Cachear catálogos casi estáticos (Etapas, Roles)

**Tier 3 — medio (puede tocar schema o agregar una vista nueva)**
- [x] #12 Duplicar protocolo
- [x] #7 Auditoría con filtro de fecha/usuario/entidad
- [x] #15 Archivar proyectos completados
- [x] #1 Paginación en listas largas
- [x] #21 Rate limiting básico en rutas de API
- [x] #29 Suspense granular en `/alertas`
- [x] #35 Exportar el dashboard completo a PDF
- [x] #32 Dashboard de cumplimiento por cliente
- [ ] #16 Comentarios en Solicitudes (modelo nuevo)
- [ ] #11 Adjuntar múltiples archivos por paso (modelo nuevo)
- [ ] #14 Timeline de proyecto
- [ ] #17 Picker de usuario con búsqueda

**Tier 4 — grande / depende de una decisión externa**
- [ ] #23 RLS diferenciado por rol (sensible: cambia policies en producción)
- [ ] #9 Notificaciones reales por correo (requiere elegir proveedor)
- [ ] #10 Cron diario de alertas (depende de #9 para tener a quién notificar)
- [ ] #13 Plantillas de proyecto
- [ ] #34 Métricas de tiempo por protocolo
- [ ] #2 Buscador global (Cmd/Ctrl+K)
- [ ] #22 Storybook / catálogo de componentes
- [ ] #27 Política de retención de Storage/auditoría (decisión de negocio, no solo código)
- [ ] #8 Revisión de accesibilidad (auditoría, no build)

---

## Recomendaciones (34)

Propuestas propias, agrupadas por área. Ninguna depende de JIRA. El check indica que ya se implementó
(ver también "Priorización por complejidad" arriba y "Implementado" al inicio del documento).

### UX/UI

1. ✅ **Paginación en las listas** — `/proyectos`, `/protocolos` y `/clientes` siguen trayendo todo (los volúmenes actuales no lo justifican y así el buscador client-side sigue viendo el set completo), pero ahora paginan el *render* (`components/ui/Paginacion.tsx`, 20-24 por página) en vez de listar cientos de cards de una vez, y la página se resetea a 1 al escribir en el buscador. `/auditoria` sí traía datos acotados sin forma de ver más: ahora pagina de verdad a nivel de Prisma (`skip`/`take` + `count`, 50 por página, filtros preservados en la URL).
2. **Buscador global (Cmd/Ctrl+K)** — un solo cuadro que busque a la vez en proyectos, protocolos, clientes y solicitudes, en vez de tres buscadores independientes por vista.
3. **Pantalla de error propia** (`error.tsx` de Next.js) — hoy un error no controlado muestra el mensaje crudo de Next con el `digest`; una pantalla con "algo salió mal, reintentar" es más apropiada para usuarios no técnicos.
4. ✅ **Modo oscuro con toggle manual** — botón en el sidebar (`ThemeToggle.tsx`) que cicla Automático → Claro → Oscuro, guardado en `localStorage` y aplicado via `data-theme` en `<html>` (con `suppressHydrationWarning` para el script anti-FOUC que lo fija antes del primer paint). De paso se corrigió `--color-surface-hover`, un token que varios botones ya referenciaban en Tailwind pero no existía, y el salto de contraste `bg-surface`→`bg-bg` en hover que era casi imperceptible en tema oscuro.
6. ✅ **Onboarding para cuenta sin rol** — el dashboard ahora muestra el nombre/correo de los titulares de los roles admin (`esAdmin: true`) en vez de un párrafo genérico. Si ningún rol admin tiene titular asignado, cae al texto genérico "Líder técnico o Director/a".
7. ✅ **Auditoría con filtro de fecha/usuario/entidad** — filtro server-side (`?desde&hasta&usuarioId&entidad`, sin JS) sobre toda la tabla, no solo los últimos 100 ya cargados; sigue mostrando como máximo 100 resultados del filtro aplicado.
8. **Revisión de accesibilidad con una herramienta tipo axe** — contraste de colores en tema oscuro y navegación 100% por teclado no se probaron formalmente.

### Funcionalidad

9. **Notificaciones reales por correo** (vía Resend o el propio SMTP de Supabase, sin Slack ni JIRA) para: solicitud asignada a tu rol, fecha de compromiso a ≤48h, protocolo con gate incumplido en la etapa actual.
10. **Cron diario de alertas** — hoy `/alertas` es "on-demand" (solo se calcula si alguien entra a mirar); un cron que corra la misma lógica una vez al día y dispare la notificación del punto 9 la vuelve proactiva.
11. **Adjuntar múltiples archivos por paso** — hoy `evidencia_url` es un solo valor (link o archivo); un paso de checklist a veces necesita más de una evidencia.
12. ✅ **Duplicar protocolo** — botón "Duplicar" en el detalle del protocolo; crea uno nuevo ("Nombre (copia)", con contador si ya existe) con los mismos pasos/estados de la versión vigente como v1, y redirige directo a editarlo.
13. **Plantillas de proyecto** — crear un proyecto que ya arranque con ciertos protocolos pre-iniciados según el tipo de proyecto (ej. todo proyecto WordPress arranca con "Seguridad WordPress" en curso).
14. **Timeline de proyecto** — vista dedicada de cambios de etapa a lo largo del tiempo (hoy ese historial existe en `EventoAuditoria` pero no hay una vista que lo muestre agrupado por proyecto).
15. ✅ **Archivar proyectos completados** — columna `Proyecto.archivado` (migración `20260813160000_add_proyecto_archivado`); toggle "Archivar"/"Desarchivar" en el detalle del proyecto. Excluido por defecto de `/proyectos` (con tab "Activos/Archivados"), `/dashboard`, `/alertas` y del selector de proyecto al crear una Solicitud.
16. **Comentarios en Solicitudes** — hoy los comentarios con autor/fecha solo existen en pasos de checklist, no en solicitudes.
17. **Picker de usuario con búsqueda** — el selector de titular/reemplazo en `/roles` y el de responsable en `/usuarios` son `<select>` simples; con más usuarios conviene un combobox con búsqueda.

### Calidad y mantenibilidad

18. **Tests automatizados** — `vitest` está instalado; hay tests para `lib/protocolos/estados.ts`, `lib/slug.ts` y `lib/actionResult.ts`, pero ninguno para `lib/proyectos/semaforo.ts` (la lógica más sensible a errores silenciosos) ni para la capa de Server Actions/permisos.
19. **CI en GitHub Actions** — typecheck + lint + build en cada PR. Hoy nada impide mergear código que no compila.
20. **README con instrucciones de seed** — cómo correr `npx prisma db seed`, qué protocolos siembra y que el contenido de Seguridad WordPress es un borrador (para que no se asuma que es el xlsx real).
21. ✅ **Rate limiting básico en las rutas de API** (`lib/rateLimit.ts`) — fixed window en memoria por usuario, sin dependencias nuevas: 60/min en `PATCH /api/ejecucion-paso/[id]`, 30/min en `POST .../comentarios`, 20/min en `POST /api/ejecucion-protocolo`. Es por instancia de función, no distribuido entre instancias — suficiente como primera barrera, no un límite estricto; eso pediría un store compartido (Upstash Redis vía Marketplace, ver #23/#9 que sí tocan infraestructura nueva).
22. **Storybook o catálogo de componentes** — `components/ui/` ya tiene un sistema de diseño consistente (Card, Badge, Button, etc.); documentarlo visualmente ayuda a mantener consistencia cuando el equipo crezca.

### Seguridad y datos

23. **RLS diferenciado por rol** — hoy todas las policies son "cualquier autenticado lee/escribe"; la diferencia entre admin y el resto de los roles vive solo en el código de la aplicación, no en la base de datos. Si alguien pega directo contra Supabase con la clave equivocada, no hay una segunda barrera por rol.
24. ✅ **Validación de tamaño/tipo de archivo en el upload de evidencia** — `EvidenciaField.tsx` valida 15MB máx. y tipos permitidos (imagen/PDF/Office/texto) antes de subir. **Es solo client-side**: el upload va directo del browser al bucket, no pasa por una Server Action, así que un cliente que se salte el chequeo igual podría subir cualquier cosa. La barrera real de defensa en profundidad es configurar `fileSizeLimit`/`allowedMimeTypes` en el bucket `evidencia` desde Supabase (Project Settings → Storage) — no se hizo porque requiere `SUPABASE_SERVICE_ROLE_KEY` a mano fuera de este repo.
25. **Headers de seguridad HTTP** (CSP, `X-Frame-Options`, etc.) — Next no los configura por default y hoy no hay ninguno custom en `next.config.ts`.
26. **Rotar y documentar `SUPABASE_SERVICE_ROLE_KEY`** cuando se agregue (punto pendiente de arriba) — es la clave más sensible del proyecto, con acceso total a Supabase; dejar por escrito quién la generó y cuándo rotarla.
27. **Política de retención explícita** para el bucket de Storage y para `EventoAuditoria` — hoy crecen indefinidamente sin un criterio de cuánto tiempo se conservan.

### Performance e infraestructura

28. ✅ **Cachear catálogos que casi no cambian** (Etapas, Roles) — `lib/catalogos.ts` (`unstable_cache`, no la nueva directiva `"use cache"`/Cache Components: es de opt-in global y más riesgo de tocar el resto de las páginas `force-dynamic`). Etapas cachea indefinido (sin mutación en la app); Roles se invalida con `revalidateTag("roles", "max")` desde `/roles/actions.ts` cuando se edita.
29. ✅ **Suspense granular en páginas pesadas** — `/alertas` separó Proyectos y Solicitudes en dos componentes servidor con su propia consulta, cada uno en su `<Suspense>`; el título y la descripción aparecen al instante y cada sección se streamea cuando su query termina, en vez de esperar ambas antes de mostrar nada. El `loading.tsx` de la ruta quedó sin uso (la página ya no tiene un `await` a nivel raíz que lo dispare) y se eliminó.
30. **Habilitar Speed Insights / Web Analytics en Vercel** — estaban deshabilitados durante todo este debugging; sin eso, un problema de latencia real solo se nota cuando alguien se queja, no antes.
31. **Revisar el tamaño del connection pool de `pg`** (`@prisma/adapter-pg`) para el entorno serverless — hoy usa la configuración por default; vale la pena revisar si conviene un `max` más chico dado que cada función serverless ya pasa por el pooler de Supabase (pgbouncer).

### Reportería / negocio

32. ✅ **Dashboard de cumplimiento por cliente** — sección nueva en `/clientes/[id]` con proyectos/protocolos completos/en curso y % de pasos completos agregado de todos los proyectos del cliente (suma de pasos, no promedio de porcentajes: un proyecto de 40 pasos pesa lo que corresponde, no lo mismo que uno de 2). Cada proyecto del listado también muestra su propia barra de progreso.
33. ✅ **Exportar auditoría a CSV** — botón client-side en `/auditoria` (con BOM UTF-8 para que Excel no rompa tildes). Exporta los últimos 100 eventos cargados en la página, no toda la tabla histórica.
34. **Métricas de tiempo por protocolo** — cuánto tarda en promedio un protocolo en completarse, por tipo de protocolo; sirve para estimar mejor futuros proyectos.
35. ✅ **Exportar el dashboard completo a PDF** (`/dashboard/imprimir`) — tabla de todos los proyectos activos (cliente, etapa, progreso, semáforo) en la misma vista imprimible + `window.print()` que ya se usaba para un checklist individual; `PrintButton` se movió a `components/ui/` para compartirlo entre ambas.
