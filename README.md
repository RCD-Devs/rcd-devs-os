# RCD OS

**Sistema Operativo Interno de RCD** — capa de gobernanza sobre JIRA.

RCD OS traduce el trabajo real en estado accionable: qué está bien, qué está atrasado, qué protocolo falta y quién tiene que actuar. No reemplaza JIRA — lo lee y lo enriquece.

> 📄 El diseño completo del producto (etapas, roles, reglas de semáforo, protocolos, modelo de datos y fases) vive en [`RCD-OS-Roadmap.md`](./RCD-OS-Roadmap.md). Este README es la puerta de entrada técnica al repo; el roadmap es la fuente de verdad del negocio.

---

## Principio rector

**JIRA administra el trabajo. RCD OS administra el proceso.**

- Roles, no personas — cada responsabilidad se asigna a un rol con titular y reemplazo.
- Estados calculados, no declarados — el semáforo verde/amarillo/rojo sale de reglas, nadie lo pinta a mano.
- Protocolos versionados — un proyecto queda congelado a la versión de protocolo con la que partió.
- JIRA es la fuente de verdad de tareas. RCD OS lee siempre; escribe solo en flujos controlados.
- Sin sync bidireccional completo en el MVP.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (App Router) + Tailwind |
| Backend | Next.js API routes / Route Handlers |
| Base de datos | Supabase (Postgres) + Prisma |
| Auth | Supabase Auth (RLS para permisos a nivel de fila) |
| Jobs / alertas | Supabase Edge Functions (cron) o Vercel Cron |
| Integración | JIRA REST API + webhooks |
| Archivos / evidencias | Supabase Storage |
| Deploy | Vercel |
| Auditoría | Tabla append-only en Supabase |

Diseño UI: minimalista, prioriza densidad de información sobre decoración. Full responsive, incluyendo mobile.

## Estado del proyecto

Actualmente en **Fase 0 — Definiciones** (sin código todavía). Ver el detalle de fases y checklist en el [roadmap](./RCD-OS-Roadmap.md#8-roadmap-de-fases-y-tiempos-estimados).

| Fase | Contenido | Duración estimada |
|---|---|---|
| 0 — Definiciones | Cerrar etapas, roles, protocolo de ambientes | 3–5 días |
| 1 — MVP | Auth, sync JIRA read-only, dashboard, checklist, solicitudes | 3–4 semanas |
| 2 — Automatización | Issues automáticos en JIRA, notificaciones, escalamiento | 2–3 semanas |
| 3 — Producción y adopción | Hardening, piloto, documentación, rollout | 2 semanas |

## Flujo de trabajo con IA

- **Claude Code** — scaffolding de backend: modelos Prisma, API routes, integración JIRA, lógica de reglas de semáforo.
- **Cursor** — desarrollo de UI/dashboard e iteración visual.
- **Regla de equipo:** la IA implementa, no diseña el negocio. Las reglas de gates, semáforo y prioridad de alertas ya están decididas en el roadmap — no se le pide a la IA que las invente.

## Contribuir

Antes de abrir una rama o un PR, revisa [`CONTRIBUTING.md`](./CONTRIBUTING.md) — define la convención de ramas, commits y el flujo de merge a `main` que usa este repo.

## Licencia

Uso interno — RCD.
