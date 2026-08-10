# RCD OS — Roadmap de Construcción
### Sistema Operativo Interno de RCD (capa de gobernanza sobre JIRA)

**Objetivo:** dejar de perder protocolos en Drive y visibilidad de proyectos en JIRA. Construir una capa que traduzca el trabajo real en estado accionable: qué está bien, qué está atrasado, qué protocolo falta, quién tiene que actuar.

**Principio rector:** JIRA administra el trabajo. RCD OS administra el proceso. No se reemplaza JIRA, se lee y se enriquece.

---

## 0. Alcance y decisiones de diseño (no negociables)

- Roles, no personas. Cada responsabilidad se asigna a un rol (ej. "Infraestructura"), con un titular y un reemplazo. Nunca se amarra a un nombre.
- Estados calculados, no declarados. El semáforo verde/amarillo/rojo sale de reglas, nadie lo pinta a mano.
- Protocolos versionados. Un proyecto que arrancó con protocolo v1.3 no se actualiza solo a v1.4. Queda congelado a la versión con la que partió.
- JIRA sigue siendo la fuente de verdad de tareas. RCD OS lee siempre; escribe solo en flujos controlados (crear solicitud, crear issue desde checklist, comentar, actualizar fecha).
- Sin sync bidireccional completo en el MVP. Es la fuente típica de bugs raros y no aporta en esta etapa.

---

## 1. Ciclo de vida de proyecto (etapas oficiales)

Esta es la columna vertebral. Todo lo demás (protocolos, alertas, dashboard) cuelga de acá.

| # | Etapa | Condición de salida (gate) |
|---|-------|------------------------------|
| 0 | Preinicio | Alcance y presupuesto aprobados, responsable interno asignado, contactos del cliente registrados |
| 1 | Kickoff | Objetivos, alcance, canales, responsables e hitos definidos y confirmados por escrito |
| 2 | Preparación técnica | Repo creado, ambientes solicitados/creados, accesos entregados, flujo Git y CI/CD definidos |
| 3 | Diseño / definición funcional | Wireframes o diseño aprobado por el cliente |
| 4 | Desarrollo | Repo, ambiente y alcance aprobado existen (bloqueante — no puede iniciar sin esto) |
| 5 | QA | Funcional, responsive, seguridad y rendimiento validados |
| 6 | Paso a producción | Respaldo hecho, plan de rollback definido, checklist de producción cerrado |
| 7 | Entrega y cierre | Accesos y documentación entregados, aceptación del cliente registrada |

Cada gate es una condición dura: si no se cumple, la etapa no avanza salvo excepción explícita registrada por un líder (con motivo y firma).

**Acción pendiente antes de codear:** validar esta tabla con el equipo — puede que falten o sobren etapas según cómo trabajan hoy.

---

## 2. Matriz de roles y responsabilidades

| Rol | Responsable de | Aprueba |
|---|---|---|
| Líder técnico (tú) | Excepciones a gates, revisión de protocolos de seguridad | Excepciones, paso a producción |
| Infraestructura / Plataforma | Ambientes, DNS, credenciales, respaldos | Entrega de ambiente |
| Desarrollador backend/frontend | Ejecución de checklist técnico | — |
| Líder de proyecto/cliente | Kickoff, aprobación de alcance y diseño | Aprobación de cliente |
| Legal (externo o interno) | Validación final de protocolo de cookies/datos | Cumplimiento legal |

**Acción pendiente:** completar con nombres de titular + reemplazo por rol. Esto vive en la plataforma, no en un Excel — si cambia alguien, se actualiza en un solo lugar.

---

## 3. Reglas de semáforo (estado calculado)

**Verde:** sin tareas críticas atrasadas, próximos hitos dentro de plazo, sin bloqueos activos, protocolos obligatorios al día.

**Amarillo:** tareas próximas a vencer (≤48h), bloqueo menor, protocolo incompleto pero dentro de plazo.

**Rojo:** hito atrasado, tarea crítica vencida, ambiente/acceso bloqueando el proyecto, sin movimiento en JIRA por más de 5 días, etapa iniciada sin gate cumplido.

**Definido:** "tarea crítica" = prioridad `Highest` en JIRA (se usa el campo de prioridad nativo, no se crea un label nuevo). `High` puede tratarse como señal de amarillo si aparece próxima a vencer.

---

## 4. Biblioteca de protocolos — prioridad de construcción

**Decisión:** RCD OS es un aplicativo tipo plantilla con checklist estructurado, NO un gestor documental. No se construye versionado libre de archivos, carpetas ni búsqueda de texto — eso lo resuelve Drive. Un documento de referencia sin checklist (ej. contratos, documento de alcance/mantención) se adjunta como link/archivo a un protocolo o proyecto; no es un módulo aparte.

1. **Ciclo de vida de proyecto** (el mapa de arriba, formalizado)
2. **Creación de ambientes** (el caso de uso que mencionaste — flujo de solicitud)
3. **Seguridad WordPress** (ya existe, se migra a formato checklist) — ver definición abajo
4. **Elementos básicos de sitio web** (ya existe, se migra a formato checklist) — ver definición abajo
5. **Cookies y protección de datos** — inventario de proveedores/cookies por proyecto, validación legal final
6. **Paso a producción** — documento narrativo existente (docx), requiere decantarse a checklist antes de migrar
7. Resto (QA técnico, gestión de accesos, incidentes) — fase 2, no bloquean el MVP

Cada protocolo en la plataforma tiene: objetivo, alcance, responsable, versión, checklist con pasos, evidencia requerida por paso, aprobador.

### 4.1 Protocolo: Elementos básicos de sitio web

- **Etapa del ciclo de vida donde aplica:** 3 — Diseño/definición funcional
- **Origen:** migrado desde xlsx existente (uno por cliente hoy, se vuelve una `EjecucionProtocolo` por proyecto)
- **Estados de paso:** `Pendiente / En curso / Completo / No aplica`
- **Estructura del paso (JSON):** `{ nombre, estado, fecha_inicio, fecha_fin, notas }`
- **Pasos (14):** Favicon, Página 404, Página Gracias, Buscador, Página de resultados, Menú de navegación activo, Menú mobile completo, Logos en todos los formatos, UI kit/design system, Interacciones, Efectos de movimiento, Filtros, Mapa de navegación, Estandarización de íconos

### 4.2 Protocolo: Seguridad WordPress

- **Etapa del ciclo de vida donde aplica:** 6 — Paso a producción (gate obligatorio); revisión parcial también en etapa 4 — Desarrollo
- **Origen:** migrado desde xlsx existente (hoja maestra sin estado = `VersionProtocolo`; una hoja por cliente con estado = `EjecucionProtocolo`)
- **Estados de paso:** `Implementado / Pendiente / No aplica`
- **Estructura del paso (JSON):** `{ item, tipo, donde, detalles, procedimiento, estado }` — `procedimiento` debe soportar texto largo con código (headers .htaccess, snippets PHP), no un input de una línea
- **~55 pasos**, agrupados por `tipo`: Header de seguridad · Restringir acceso a archivos · Autenticación y control de acceso · Validación y sanitización · Escaneos y pruebas

---

## 5. Modelo de datos (entidades mínimas para MVP)

```
Usuario (id, nombre, email, rol_id)
Rol (id, nombre, titular_id, reemplazo_id)
Cliente (id, nombre)
Proyecto (id, cliente_id, nombre, etapa_actual, fecha_inicio, fecha_compromiso, jira_project_key)
Etapa (id, nombre, orden, gate_descripcion)

Protocolo (id, nombre, objetivo, alcance)
VersionProtocolo (id, protocolo_id, numero_version, fecha_publicacion, pasos_json)
EjecucionProtocolo (id, proyecto_id, version_protocolo_id, estado, fecha_limite)
EjecucionPaso (id, ejecucion_id, paso_nombre, estado, responsable_id, evidencia_url, fecha_ejecucion)

Solicitud (id, proyecto_id, tipo, estado, solicitante_id, responsable_rol_id, sla_fecha_limite)

IssueJiraCache (id, proyecto_id, jira_key, titulo, estado, asignado, fecha_vencimiento, prioridad, ultima_actualizacion)

Alerta (id, proyecto_id, tipo, nivel, estado, fecha_creacion, fecha_resolucion)
EventoAuditoria (id, entidad, entidad_id, usuario_id, accion, timestamp) -- append-only
```

Esto es lo mínimo para que el semáforo, los protocolos y las solicitudes funcionen. Todo lo demás (métricas históricas, plantillas por tipo de proyecto) es fase 2.

---

## 6. Stack técnico

**Repo:** `rcd-devs-os` (GitHub)

- **Frontend:** Next.js (App Router) + Tailwind
- **Backend:** Next.js API routes / Route Handlers (Supabase corre serverless, no necesitas un backend separado en Railway/Render)
- **DB:** Supabase (Postgres administrado) + Prisma como ORM sobre la conexión de Supabase
- **Auth:** Supabase Auth (reemplaza Auth.js — maneja login, sesiones y roles vía RLS si se necesita más adelante)
- **Jobs/alertas:** Supabase Edge Functions con cron, o Vercel Cron si prefieres mantenerlo todo en Vercel
- **Integración JIRA:** API REST + webhooks para eventos (cambio de estado, comentario)
- **Evidencias/archivos:** Supabase Storage (reemplaza Cloudflare R2 — mismo proyecto, un proveedor menos)
- **Deploy:** Vercel (frontend + funciones serverless)
- **Auditoría:** tabla append-only en Supabase, nunca se borra ni edita

**Nota:** Supabase también trae Row Level Security (RLS) nativo — vale la pena usarlo para las tablas de `EjecucionPaso` y `Solicitud` en vez de controlar permisos solo a nivel de aplicación, así el acceso queda garantizado incluso si alguien pega directo a la base.

**Diseño UI:** minimalista — prioriza densidad de información clara sobre decoración, nada de elementos visuales que no aporten función. Full responsive en todas las vistas (dashboard, checklist, formularios de solicitud), incluyendo mobile, ya que el equipo va a necesitar revisar estados y aprobar pasos desde el teléfono.

---

## 7. Flujo de trabajo con Claude Code + Cursor

- **Claude Code:** scaffolding del backend (modelos Prisma, API routes, integración JIRA, lógica de reglas de semáforo). Es donde más rinde: lógica de negocio bien definida = generación rápida y confiable.
- **Cursor:** desarrollo de UI/dashboard, iteración visual rápida, ajustes de componentes.
- **Regla de equipo:** nadie le pide a la IA que "invente" la lógica de negocio (gates, reglas de semáforo, prioridad de alertas) — esa lógica sale de este documento, ya decidida. La IA implementa, no diseña el negocio.
- Definir convención de ramas y revisión de código antes de empezar (quién revisa qué, aunque sea informal al inicio).

---

## 8. Roadmap de fases y tiempos estimados

### Fase 0 — Definiciones (sin código) — 3 a 5 días
- [ ] Validar y cerrar tabla de etapas del ciclo de vida con el equipo
- [ ] Completar matriz de roles con titulares y reemplazos reales
- [x] Cerrar reglas de semáforo — 5 días sin movimiento = rojo; "crítico" = prioridad `Highest` de JIRA
- [ ] Redactar protocolo de "Creación de ambientes" en formato checklist
- [ ] Migrar protocolo de seguridad WordPress a formato checklist
- [ ] Definir qué label/campo en JIRA marca tarea crítica (y empezar a etiquetar)

### Fase 1 — MVP — 3 a 4 semanas
- [ ] Auth + login
- [ ] Sync de proyectos e issues desde JIRA (solo lectura)
- [ ] Dashboard ejecutivo con semáforo calculado
- [ ] Vista de proyecto individual (etapa, tareas, timeline simple)
- [ ] Biblioteca de protocolos (los 2 primeros: ambientes y seguridad WP)
- [ ] Ejecución de checklist por proyecto con evidencia
- [ ] Flujo de solicitud de ambiente (formulario → asignación a rol → estado)
- [ ] Alertas básicas por fecha (informativa/advertencia/crítica)

### Fase 2 — Automatización — 2 a 3 semanas
- [ ] Creación automática de issues en JIRA desde protocolo/checklist
- [ ] Notificaciones (Slack o correo)
- [ ] Escalamiento de alertas críticas
- [ ] Protocolo de cookies/datos con inventario por proyecto
- [ ] Resto de protocolos (QA técnico, accesos, incidentes)

### Fase 3 — Producción y adopción — 2 semanas
- [ ] Hardening (permisos, rate limits de JIRA, manejo de errores de sync)
- [ ] Piloto con 2-3 proyectos activos antes de rollout completo
- [ ] Documentación de uso para el equipo
- [ ] Definir dueño de mantención permanente (quién actualiza protocolos, resuelve bugs)
- [ ] Rollout completo

**Total estimado: 8 a 10 semanas**, asumiendo que la Fase 0 se cierra rápido y el equipo tiene tiempo dedicado (no es "en los ratos libres").

---

## 9. Riesgos a vigilar

- **Adopción:** el problema original fue "no todos usan JIRA". Una herramienta nueva puede sufrir lo mismo si no hay un piloto forzado con 2-3 proyectos reales antes del rollout general.
- **Mantención:** definir quién es dueño de esto a largo plazo, no solo quién lo construye.
- **Rate limits de JIRA API:** revisar límites del plan de RCD antes de diseñar la frecuencia de sync.
- **Alcance del legal:** el protocolo de cookies necesita validación de alguien con competencia legal — la plataforma solo impide implementar sin evaluación, no reemplaza el criterio legal.

---

## 10. Próximo paso inmediato

Cerrar la Fase 0 esta semana: la tabla de etapas, la matriz de roles y el protocolo de ambientes en checklist. Sin eso, cualquier línea de código en Claude Code o Cursor va a tener que rehacerse cuando se definan las reglas reales.
