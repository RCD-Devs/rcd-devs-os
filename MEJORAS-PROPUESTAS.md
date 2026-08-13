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

**Funcionalidad**
- **Semáforo verde/amarillo/rojo** (`lib/proyectos/semaforo.ts`) — reglas propias, **sin JIRA**: se calcula a partir de `fechaCompromiso` del proyecto y `fechaLimite` de cada ejecución de protocolo activa.
- **UI de Roles** (`/roles`) — asignar titular/reemplazo y alternar acceso admin por rol.
- **Sistema de permisos por rol** (`Rol.esAdmin`) — Líder técnico y Director/a con control total (incluye `/roles` y `/usuarios`); el resto de los roles con CRUD completo sobre lo operativo (Protocolos, Proyectos, Clientes, Solicitudes) pero sin ver la configuración de permisos. Guard server-side en página y en cada server action, no solo ocultar el link.
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

**Infraestructura / deploy**
- **Migración a Prisma Driver Adapters** (`@prisma/adapter-pg` + `engineType: "client"`) — el deploy en Vercel fallaba en producción (`PrismaClientInitializationError`, motor nativo no encontrado) pese a tres intentos de configurar correctamente el empaquetado del binario. La solución fue eliminar la dependencia del binario nativo: Prisma ahora usa el driver `pg` en JS puro.
- **Región de las funciones de Vercel alineada con Supabase** — las funciones corrían en `iad1` (EE.UU., costa este) mientras la base está en `sa-east-1` (São Paulo); cada query cruzaba el continente. Cambiado a `gru1` (São Paulo). Esto explica gran parte del delay de navegación reportado — revisar si con Fluid Compute + región correcta se siente suficientemente rápido antes de invertir en más optimización (ver pendientes).

**Corrección a este documento**: la versión anterior decía que no había RLS en Supabase. Eso era un error — RLS ya estaba habilitado desde antes (`EjecucionProtocolo`, `EjecucionPaso`) con policies de "cualquier autenticado lee/escribe". Las tablas nuevas siguen ese mismo criterio; `EventoAuditoria` además no tiene policy de `UPDATE`/`DELETE`, para que el append-only se cumpla a nivel de base de datos.

---

## Sigue pendiente

**Depende de JIRA (fuera de alcance por decisión del equipo)**
- Sync de proyectos/issues desde JIRA
- Semáforo con las reglas *originales* del roadmap (inactividad en JIRA, prioridad `Highest`)
- Creación automática de issues en JIRA desde un protocolo/checklist

**Depende de credenciales externas que no están en `.env`**
- Invitar usuarios desde `/usuarios` — el botón queda deshabilitado hasta agregar `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API en Supabase). Mientras tanto, invitar desde el dashboard de Supabase funciona igual: el usuario aparece automáticamente en `/usuarios` para asignarle rol.
- Notificaciones reales por Slack/correo (el centro de alertas in-app es el sustituto mientras tanto)

**Vale la pena revisar con el equipo**
- El contenido borrador de Seguridad WordPress / Creación de ambientes / Cookies
- Las reglas del semáforo propio (¿7 días para pasar a amarillo es el número correcto?)
- Probar la nav mobile en un dispositivo real, no solo en devtools
- La tensión entre "diseño minimalista, sin decoración" (roadmap §6) y la dirección visual más rica que se tomó en estas sesiones

---

## Recomendaciones (35)

Propuestas propias, no implementadas todavía, agrupadas por área. Ninguna depende de JIRA.

### UX/UI

1. **Paginación en las listas** — hoy `/proyectos`, `/protocolos`, `/clientes`, `/auditoria` traen todos los registros sin límite; funciona con los volúmenes actuales pero no escala.
2. **Buscador global (Cmd/Ctrl+K)** — un solo cuadro que busque a la vez en proyectos, protocolos, clientes y solicitudes, en vez de tres buscadores independientes por vista.
3. **Pantalla de error propia** (`error.tsx` de Next.js) — hoy un error no controlado muestra el mensaje crudo de Next con el `digest`; una pantalla con "algo salió mal, reintentar" es más apropiada para usuarios no técnicos.
4. **Modo oscuro con toggle manual** — hoy solo sigue la preferencia del sistema operativo; útil si alguien quiere forzarlo independiente del SO.
5. **Confirmación antes de acciones destructivas** — todavía no hay ningún "eliminar" en la UI, pero cuando se agregue (proyecto, protocolo, usuario) va a necesitar un modal de confirmación, no un click directo.
6. **Onboarding para cuenta sin rol** — hoy el mensaje es un párrafo de texto ("cuenta pendiente de configuración"); podría mostrar directo a quién contactar (los titulares de "Líder técnico"/"Director/a" ya están en la tabla `Rol`).
7. **Auditoría con filtro de fecha/usuario/entidad** — hoy `/auditoria` solo muestra los últimos 100 eventos sin poder acotar por rango o buscar por persona.
8. **Revisión de accesibilidad con una herramienta tipo axe** — contraste de colores en tema oscuro y navegación 100% por teclado no se probaron formalmente.

### Funcionalidad

9. **Notificaciones reales por correo** (vía Resend o el propio SMTP de Supabase, sin Slack ni JIRA) para: solicitud asignada a tu rol, fecha de compromiso a ≤48h, protocolo con gate incumplido en la etapa actual.
10. **Cron diario de alertas** — hoy `/alertas` es "on-demand" (solo se calcula si alguien entra a mirar); un cron que corra la misma lógica una vez al día y dispare la notificación del punto 9 la vuelve proactiva.
11. **Adjuntar múltiples archivos por paso** — hoy `evidencia_url` es un solo valor (link o archivo); un paso de checklist a veces necesita más de una evidencia.
12. **Duplicar protocolo** — clonar uno existente como punto de partida en vez de escribir todos los pasos desde cero cada vez.
13. **Plantillas de proyecto** — crear un proyecto que ya arranque con ciertos protocolos pre-iniciados según el tipo de proyecto (ej. todo proyecto WordPress arranca con "Seguridad WordPress" en curso).
14. **Timeline de proyecto** — vista dedicada de cambios de etapa a lo largo del tiempo (hoy ese historial existe en `EventoAuditoria` pero no hay una vista que lo muestre agrupado por proyecto).
15. **Archivar proyectos completados** — hoy un proyecto cerrado sigue apareciendo igual que uno activo en todas las listas y en el dashboard.
16. **Comentarios en Solicitudes** — hoy los comentarios con autor/fecha solo existen en pasos de checklist, no en solicitudes.
17. **Picker de usuario con búsqueda** — el selector de titular/reemplazo en `/roles` y el de responsable en `/usuarios` son `<select>` simples; con más usuarios conviene un combobox con búsqueda.

### Calidad y mantenibilidad

18. **Tests automatizados** — `vitest` está instalado y hay un script `test` en `package.json`, pero no existe ni un solo archivo `.test.ts` en el repo: cobertura real es 0%.
19. **CI en GitHub Actions** — typecheck + lint + build en cada PR. Hoy nada impide mergear código que no compila.
20. **README con instrucciones de seed** — cómo correr `npx prisma db seed`, qué protocolos siembra y que el contenido de Seguridad WordPress es un borrador (para que no se asuma que es el xlsx real).
21. **Rate limiting básico en las rutas de API** (`/api/ejecucion-paso/[id]`, `/api/ejecucion-protocolo`) — hoy cualquier request autenticado puede llamarlas sin límite de frecuencia.
22. **Storybook o catálogo de componentes** — `components/ui/` ya tiene un sistema de diseño consistente (Card, Badge, Button, etc.); documentarlo visualmente ayuda a mantener consistencia cuando el equipo crezca.

### Seguridad y datos

23. **RLS diferenciado por rol** — hoy todas las policies son "cualquier autenticado lee/escribe"; la diferencia entre admin y el resto de los roles vive solo en el código de la aplicación, no en la base de datos. Si alguien pega directo contra Supabase con la clave equivocada, no hay una segunda barrera por rol.
24. **Validación de tamaño/tipo de archivo en el upload de evidencia** — hoy el bucket `evidencia` acepta cualquier archivo sin límite de tamaño ni tipo MIME.
25. **Headers de seguridad HTTP** (CSP, `X-Frame-Options`, etc.) — Next no los configura por default y hoy no hay ninguno custom en `next.config.ts`.
26. **Rotar y documentar `SUPABASE_SERVICE_ROLE_KEY`** cuando se agregue (punto pendiente de arriba) — es la clave más sensible del proyecto, con acceso total a Supabase; dejar por escrito quién la generó y cuándo rotarla.
27. **Política de retención explícita** para el bucket de Storage y para `EventoAuditoria` — hoy crecen indefinidamente sin un criterio de cuánto tiempo se conservan.

### Performance e infraestructura

28. **Cachear catálogos que casi no cambian** (Etapas, Roles) — hoy cada página con `force-dynamic` los vuelve a consultar completos en cada request; son datos que cambian con muy poca frecuencia.
29. **Suspense granular en páginas pesadas** — `/alertas` calcula el semáforo de *todos* los proyectos antes de poder mostrar nada; con `<Suspense>` por sección se podría mostrar el layout de inmediato y las alertas a medida que están listas.
30. **Habilitar Speed Insights / Web Analytics en Vercel** — estaban deshabilitados durante todo este debugging; sin eso, un problema de latencia real solo se nota cuando alguien se queja, no antes.
31. **Revisar el tamaño del connection pool de `pg`** (`@prisma/adapter-pg`) para el entorno serverless — hoy usa la configuración por default; vale la pena revisar si conviene un `max` más chico dado que cada función serverless ya pasa por el pooler de Supabase (pgbouncer).

### Reportería / negocio

32. **Dashboard de cumplimiento por cliente** — hoy el % de protocolos completos se ve por proyecto individual, no agregado por cliente (útil para una reunión de cuenta).
33. **Exportar auditoría a CSV** — para reportes de compliance que alguien pueda abrir en Excel sin depender de la UI.
34. **Métricas de tiempo por protocolo** — cuánto tarda en promedio un protocolo en completarse, por tipo de protocolo; sirve para estimar mejor futuros proyectos.
35. **Exportar el dashboard completo a PDF**, no solo un checklist individual — un snapshot de "estado de todos los proyectos" para compartir en una reunión.
