# Spec: Login / Auth

**Fecha:** 2026-08-10
**Estado:** Aprobado — pendiente de plan de implementación

## Contexto

RCD OS todavía no tiene código, solo documentación (`README.md`, `CONTRIBUTING.md`, `RCD-OS-Roadmap.md`). Este es el primer spec de construcción: la base de autenticación y sesión sobre la que corre todo lo demás, incluyendo el módulo de Protocolos (siguiente spec).

Referencias del roadmap: §2 (matriz de roles), §5 (modelo de datos), §6 (stack técnico).

## Decisiones tomadas en brainstorming

- **Alta de usuarios:** sin self-signup ni flujo de invitación en la app. Los usuarios se crean manualmente desde Supabase Studio.
- **Método de auth:** email + contraseña (Supabase Auth nativo).
- **Alcance de roles:** el login carga y expone el rol del usuario (nombre, email, rol) en la sesión/UI. No se construye lógica de permisos/autorización por rol en este spec — eso se diseña junto con cada feature que lo necesite (empezando por Protocolos).
- **Reset de contraseña:** incluido desde el inicio (`resetPasswordForEmail` de Supabase).
- **Sincronización Usuario/Rol:** trigger de Postgres sobre `auth.users` que auto-crea la fila `Usuario` correspondiente. El `rol_id` queda `null` hasta que se asigna a mano (no hay UI de administración todavía). Elegido por sobre "upsert en la app al primer login" (evita escritura condicional en el camino crítico de login) y por sobre "rol en `user_metadata`" (se aleja del modelo de datos ya comprometido en el roadmap §5, que necesita `Rol.titular_id`/`reemplazo_id` para la matriz de roles).

## Arquitectura

Next.js (App Router) + Supabase Auth para identidad y sesión. Prisma sobre la misma base Postgres de Supabase para los datos de aplicación (`Usuario`, `Rol`). Sesión manejada vía cookies con `@supabase/ssr`. Un middleware de Next.js protege todas las rutas salvo `/login`, `/reset-password` y `/update-password`. Un trigger de Postgres en `auth.users` mantiene `public."Usuario"` sincronizada automáticamente cuando se crea una cuenta desde Supabase Studio.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `app/login/page.tsx` | Formulario email + contraseña (Client Component). Llama `supabase.auth.signInWithPassword`. |
| `app/reset-password/page.tsx` | Pide el email, dispara `supabase.auth.resetPasswordForEmail`. |
| `app/update-password/page.tsx` | Landing del link de correo. Define contraseña nueva vía `supabase.auth.updateUser`. |
| `middleware.ts` | Refresca la sesión en cada request; redirige a `/login?next=` si no hay sesión válida en ruta protegida. |
| `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts` | Helpers estándar `@supabase/ssr` para crear el cliente de Supabase en cada contexto (Server Component, Client Component, middleware). |
| `lib/auth/getCurrentUser.ts` | Helper server-side: lee la sesión de Supabase y trae `Usuario` + `Rol` vía Prisma. Devuelve `null` si no hay sesión. |
| `app/dashboard/page.tsx` | Placeholder mínimo protegido: "Hola {nombre} — {rol}" + botón logout. Prueba el flujo end-to-end. El dashboard real es trabajo futuro fuera de este spec. |
| `prisma/schema.prisma` | Modelos `Usuario` y `Rol` (roadmap §5: `Usuario(id, nombre, email, rol_id)`, `Rol(id, nombre, titular_id, reemplazo_id)`). |
| `prisma/migrations/.../trigger_usuario_sync.sql` | Migración SQL cruda: función + trigger `on auth.users insert → insert into public."Usuario"`. |
| `prisma/seed.ts` | Inserta los 5 roles fijos del roadmap §2 (nombres únicamente; `titular_id`/`reemplazo_id` se completan después, fuera de este spec). |

## Flujo de datos

1. Se crea el usuario en Supabase Studio (email + password) → el trigger inserta la fila en `Usuario` con `rol_id = null`.
2. Se asigna `rol_id` a mano (SQL o Table Editor) — no hay UI de administración en este spec.
3. El usuario entra a `/login`, se autentica → Supabase deja una cookie de sesión (vía `@supabase/ssr`).
4. El middleware valida la sesión en cada request a rutas protegidas.
5. La página protegida llama a `getCurrentUser()`, que resuelve la sesión de Supabase y consulta `Usuario` + `Rol` vía Prisma (`include: { rol: true }`).
6. Logout: botón en `/dashboard` que llama `supabase.auth.signOut()` y redirige a `/login`.

## Manejo de errores

- Login fallido: mensaje genérico ("credenciales inválidas"), sin indicar si el email existe en el sistema.
- Reset password: la UI siempre responde "si el email existe, se envió un link", independientemente de si existe o no (mismo motivo — no filtrar existencia de cuentas).
- Usuario autenticado en Supabase pero sin `rol_id` asignado (admin no lo asignó todavía): la página protegida no rompe — muestra "cuenta pendiente de configuración, contacta a tu líder técnico" en vez de un error genérico o un crash por `rol` nulo.
- Sesión expirada en ruta protegida: redirige a `/login` conservando la ruta de destino vía `?next=`.

## Testing

QA manual para este spec: crear usuario en Supabase → verificar que el trigger creó la fila `Usuario` → asignar rol → login → `/dashboard` muestra nombre y rol → logout → reset password → confirmar que una ruta protegida sin sesión redirige a `/login`.

No hay lógica de negocio compleja en este spec (eso entra con Protocolos), así que no se prioriza test automatizado más allá de un test unitario opcional de `getCurrentUser` con Prisma mockeado.

## Fuera de alcance (explícitamente)

- Self-signup o invitación de usuarios desde la app.
- UI de administración de usuarios/roles (asignar `rol_id`, `titular_id`, `reemplazo_id`).
- Lógica de permisos/autorización por rol (quién puede ver o hacer qué).
- Dashboard real — solo existe un placeholder para probar el flujo.

## Siguiente paso

Módulo de Protocolos (spec 2), que depende de esta base de auth/sesión para asignar responsables y aprobadores.
