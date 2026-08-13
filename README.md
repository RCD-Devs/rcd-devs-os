# RCD OS

**Sistema Operativo Interno de RCD** — plataforma de gobernanza de procesos: protocolos versionados,
proyectos, clientes, solicitudes, roles con permisos y auditoría. Uso interno del equipo.

> 📄 El diseño original del producto (etapas, roles, reglas de semáforo, protocolos, modelo de datos)
> vive en [`RCD-OS-Roadmap.md`](./RCD-OS-Roadmap.md). Esa visión inicial contemplaba integración con
> JIRA; **por decisión explícita del equipo, esta plataforma no integra con JIRA** — todo lo que
> depende de eso quedó fuera de alcance (ver [`MEJORAS-PROPUESTAS.md`](./MEJORAS-PROPUESTAS.md) para
> el detalle de qué se implementó, qué falta y por qué).

## Principios

- Roles, no personas — cada responsabilidad se asigna a un rol con titular y reemplazo.
- Estados calculados, no declarados — el semáforo verde/amarillo/rojo sale de reglas propias
  (`lib/proyectos/semaforo.ts`), nadie lo pinta a mano.
- Protocolos versionados — un proyecto queda congelado a la versión de protocolo con la que partió;
  editar un protocolo publicado crea una v2 nueva, nunca muta la vigente.
- Auditoría append-only — `EventoAuditoria` no tiene policy de `UPDATE`/`DELETE` a nivel de base.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) + Tailwind CSS v4 |
| Backend | Server Actions + Route Handlers (Next.js) |
| Base de datos | Supabase (Postgres) + Prisma 6 (driver adapters `pg`, sin motor nativo) |
| Auth | Supabase Auth (RLS a nivel de fila) |
| Archivos / evidencias | Supabase Storage (bucket privado, URLs firmadas) |
| Deploy | Vercel |
| Auditoría | Tabla append-only en Supabase |

## Levantar el proyecto en local

```bash
npm install                 # corre `prisma generate` automáticamente (postinstall)
cp .env.example .env        # completar con las credenciales reales de Supabase
npm run dev
```

Variables requeridas en `.env` — ver comentarios en [`.env.example`](./.env.example) para el detalle
de cada una (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, y opcionalmente `SUPABASE_SERVICE_ROLE_KEY` para poder
crear/editar/eliminar usuarios desde `/usuarios`).

### Seed de datos

```bash
npx prisma db seed          # catálogos: Roles, Etapas, Protocolos base
npx tsx prisma/seed-demo.ts # opcional: clientes/proyectos de ejemplo (dev/staging, no producción)
```

`prisma db seed` siembra los catálogos fijos que la app espera que existan (los 8 roles y 8 etapas
del roadmap, más 4 protocolos). **El contenido de los protocolos "Seguridad WordPress", "Creación de
ambientes" y "Cookies y protección de datos" es un borrador de industria**, no la migración real del
xlsx interno mencionado en el roadmap — revisar con el equipo antes de usarlo en un proyecto real.
Solo "Elementos básicos de sitio web" tiene sus 14 ítems con descripciones ya curadas.

`seed-demo.ts` es un script aparte a propósito: no corre con `prisma db seed`, es re-ejecutable
(busca por nombre antes de crear, no duplica) y pensado solo para tener datos de ejemplo visibles en
dev/staging.

### Migraciones

`prisma migrate dev` **no funciona** contra este proyecto de Supabase (`P3006`: la shadow database no
tiene el schema `auth` que `Usuario.id` referencia). El flujo real es escribir la migración a mano en
`prisma/migrations/<timestamp>_<nombre>/migration.sql` y aplicarla con:

```bash
npx prisma migrate deploy
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests unitarios (Vitest) |

CI (`.github/workflows/ci.yml`) corre lint + typecheck + build en cada push/PR a `main`.

## Contribuir

Antes de abrir una rama o un PR, revisá [`CONTRIBUTING.md`](./CONTRIBUTING.md) — define la convención
de ramas, commits y el flujo de merge a `main` que usa este repo.

## Licencia

Uso interno — RCD.
