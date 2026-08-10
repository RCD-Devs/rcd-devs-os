# Convención de trabajo — RCD OS

Este repo usa **trunk-based development con nomenclatura de GitFlow**: una sola rama larga (`main`, siempre desplegable), y ramas cortas de vida corta con prefijos tipo GitFlow que se integran a `main` vía Pull Request. No hay rama `develop` ni ramas `release/*` — eso es ceremonia que no aporta en esta etapa del proyecto.

---

## 1. `main` es la rama protegida

- `main` debe quedar siempre en estado desplegable.
- Nadie commitea directo a `main`, salvo la excepción del punto 5.
- Todo cambio entra vía Pull Request, aunque sea de una sola persona revisándose a sí misma al inicio (ver roadmap §7: "definir convención de ramas y revisión de código antes de empezar").
- `main` se etiqueta con tags semánticos (`v0.1.0`, `v0.2.0`...) cuando corresponda marcar un hito de release — no hace falta una rama aparte para eso.

## 2. Nomenclatura de ramas

Formato: `<tipo>/<descripcion-corta-en-kebab-case>`

| Prefijo | Uso |
|---|---|
| `feature/` | Funcionalidad nueva (ej. `feature/sync-jira-issues`) |
| `fix/` | Corrección de bug que no es urgente en producción |
| `hotfix/` | Corrección urgente sobre algo ya en producción — mismo flujo que `feature/`, pero se prioriza el review |
| `chore/` | Tareas de mantenimiento: dependencias, config, CI, tooling |
| `docs/` | Cambios solo de documentación (README, roadmap, protocolos) |
| `refactor/` | Reestructuración de código sin cambio de comportamiento |
| `test/` | Cambios o agregado de tests sin tocar lógica de producto |

Ejemplos: `feature/dashboard-semaforo`, `fix/gate-etapa-4-no-bloquea`, `hotfix/webhook-jira-500`.

## 3. Commits convencionales

Se usa el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope opcional>): <descripción en presente, minúscula, sin punto final>
```

Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `style`, `ci`.

Ejemplos:
```
feat(protocolos): agregar checklist de seguridad WordPress
fix(semaforo): calcular rojo cuando no hay movimiento en JIRA por 5 días
docs: actualizar roadmap con matriz de roles cerrada
```

Commits atómicos: un commit, un cambio lógico. Evitar commits tipo "wip" o "fix typo" acumulados — hacer squash antes de mergear si el historial de la rama quedó desordenado.

## 4. Flujo estándar

1. Actualizar `main` local: `git checkout main && git pull`
2. Crear rama: `git checkout -b feature/nombre-corto`
3. Commits atómicos con mensajes convencionales.
4. Push de la rama y apertura de PR contra `main`.
5. El PR describe: qué cambia, por qué (referenciar la sección del roadmap o el issue de JIRA si aplica), y cómo se probó.
6. Al menos un review antes de mergear (informal al inicio, formal cuando el equipo crezca — ver roadmap §7).
7. Merge a `main` con **squash and merge** por default, para mantener el historial de `main` legible (un commit por feature/fix). Usar merge normal solo si la rama ya tiene un historial de commits que vale la pena preservar tal cual.
8. Borrar la rama después del merge.

## 5. Excepción a "nunca commitear directo a `main`"

Cambios triviales de documentación (typos, un link roto) pueden ir directo a `main` sin PR. Cualquier cosa que toque código, lógica de negocio, modelo de datos o config de infraestructura pasa por PR sin excepción — incluyendo cambios "de una línea".

## 6. Reglas de negocio (recordatorio, ver roadmap)

- Las reglas de gates, semáforo y prioridad de alertas están definidas en `RCD-OS-Roadmap.md`. No se improvisan en un PR — si un PR necesita cambiar una regla de negocio, primero se actualiza el roadmap y se discute con el equipo, después se implementa.
- La IA (Claude Code / Cursor) implementa sobre las reglas ya definidas; no decide reglas de negocio nuevas por su cuenta.
