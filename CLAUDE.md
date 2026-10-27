# CLAUDE.md — Plataforma de Gestión de Tickets de Fiscalización

Este archivo es la referencia de todo el código del repositorio. Cada carpeta de código tiene un `README.md` que lista sus archivos; **este CLAUDE.md es la fuente que define qué debe decir cada README y cómo se organiza el código**.

## Regla de documentación

1. Cada carpeta de código (módulo, subcarpeta de componentes, carpeta de `core`) tiene un `README.md`.
2. Cada README lista, con enlace, los archivos de su carpeta y dice para qué sirve cada uno.
3. Cuando se agrega, renombra o borra un archivo, se actualiza el README de su carpeta y el README padre.
4. Cuando cambia la estructura de módulos, se actualiza este archivo.

## Estructura del repositorio

| Ruta | Qué es | README |
|---|---|---|
| [frontend/](frontend/) | App móvil Expo / React Native (TypeScript). | [frontend/src/README.md](frontend/src/README.md) |
| [backend/](backend/) | API Express + PostgreSQL (JavaScript). | [backend/README.md](backend/README.md) |
| [CAMBIOS_INTEGRACION.md](CAMBIOS_INTEGRACION.md) | Notas de integración frontend-backend. | — |
| [AUTENTICACION_Y_ROLES.md](AUTENTICACION_Y_ROLES.md) | Guía de login, roles, creación de cuentas y problemas frecuentes. | — |

Reglas de modularidad: ver las secciones de cada lado.

---

## Frontend (`frontend/`)

Arquitectura por capas dentro de `src/`:

| Carpeta | Responsabilidad | README |
|---|---|---|
| `src/core/` | Piezas compartidas sin lógica de negocio. | [core/README.md](frontend/src/core/README.md) |
| `src/core/api/` | Cliente HTTP (`request`, `API_BASE_URL`). | [core/api](frontend/src/core/api/README.md) |
| `src/core/theme/` | Paleta, radios, sombras. | [core/theme](frontend/src/core/theme/README.md) |
| `src/core/ui/` | Componentes visuales reutilizables. | [core/ui](frontend/src/core/ui/README.md) |
| `src/core/utils/` | Funciones puras: fechas, días hábiles, formato. | [core/utils](frontend/src/core/utils/README.md) |
| `src/navigation/` | Registro de rutas del stack. | [navigation](frontend/src/navigation/README.md) |
| `src/modules/` | Un módulo por funcionalidad. | [modules](frontend/src/modules/README.md) |

### Módulos del frontend

| Módulo | Contenido | README |
|---|---|---|
| `modules/menu` | Menú principal. Subcarpeta `components/`. | [menu](frontend/src/modules/menu/README.md), [components](frontend/src/modules/menu/components/README.md) |
| `modules/resumen` | Resumen de tickets por estado. Subcarpeta `components/`. | [resumen](frontend/src/modules/resumen/README.md), [components](frontend/src/modules/resumen/components/README.md) |
| `modules/tickets` | Creación de tickets. Subcarpeta `components/`. | [tickets](frontend/src/modules/tickets/README.md), [components](frontend/src/modules/tickets/components/README.md) |
| `modules/contratos` | Contratos, detalle y alta. Subcarpeta `components/`. | [contratos](frontend/src/modules/contratos/README.md), [components](frontend/src/modules/contratos/components/README.md) |
| `modules/empresas` | Empresas contratistas. | [empresas](frontend/src/modules/empresas/README.md) |
| `modules/areas` | Áreas municipales. | [areas](frontend/src/modules/areas/README.md) |
| `modules/auth` | Inicio de sesión y sesión activa (primera pantalla de la app). Subcarpeta `components/`. | [auth](frontend/src/modules/auth/README.md), [components](frontend/src/modules/auth/components/README.md) |

Cada módulo sigue la misma forma:

- `<Pantalla>.tsx`: la pantalla (una por archivo).
- `api.ts`: endpoints del módulo (objeto `xxxApi`) y tipos de respuesta de la API (`XxxApi`).
- `types.ts`: tipos del modelo de la app.
- `store.ts`: cache en memoria con `cargarX()` y el hook `useX()`, cuando el módulo comparte datos entre pantallas.
- `components/`: piezas que sólo usa ese módulo.

### Reglas de dependencia (frontend)

- `core/` no importa de `modules/` ni de `navigation/`.
- Un módulo importa de otro módulo sólo a través de `api.ts`, `store.ts` o `types.ts` de ese módulo.
- Sólo `App.tsx` importa `navigation/`. Las pantallas se registran en `navigation/AppNavigator.tsx`.
- Las pantallas no llaman a `fetch` directamente: usan el `api.ts` de su módulo.
- Colores solo desde `core/theme/colors.ts`.

### Comandos (frontend)

```bash
npx expo install <paquete>   # siempre con expo install, nunca npm install de un paquete Expo
npx expo start
npx tsc --noEmit             # typecheck
npx expo lint                # requiere eslint instalado en node_modules
```

---

## Backend (`backend/`)

| Carpeta | Responsabilidad | README |
|---|---|---|
| `src/core/config/` | Pool de PostgreSQL. | [config](backend/src/core/config/README.md) |
| `src/core/middlewares/` | Manejo de errores. | [middlewares](backend/src/core/middlewares/README.md) |
| `src/modules/` | Un módulo por recurso. | [modules](backend/src/modules/README.md) |
| `sql/` | Esquema y migraciones. | [sql](backend/sql/README.md) |

### Módulos del backend

| Módulo | Prefijo | Archivos | README |
|---|---|---|---|
| `catalogos` | `/api/areas`, `/api/roles` | routes, controller | [catalogos](backend/src/modules/catalogos/README.md) |
| `usuarios` | `/api/usuarios` | routes, controller | [usuarios](backend/src/modules/usuarios/README.md) |
| `empresas` | `/api/empresas` | routes, controller | [empresas](backend/src/modules/empresas/README.md) |
| `contratos` | `/api/contratos` | routes, controller, ordenesCompra, prioridades | [contratos](backend/src/modules/contratos/README.md) |
| `tickets` | `/api/tickets` | routes, controller, respuestas, ticketStateMachine | [tickets](backend/src/modules/tickets/README.md) |
| `auth` | `/api/auth` (y middleware de sesión sobre todo `/api`) | routes, controller, sesiones, middleware | [auth](backend/src/modules/auth/README.md) |

Cada módulo sigue la misma forma:

- `<recurso>.routes.js`: sólo declara URL + verbo → función del controlador.
- `<recurso>.controller.js`: validación de entrada y consultas SQL con placeholders `$1, $2…` (nunca concatenar valores).
- Un controlador separado por sub-recurso cuando crece (por ejemplo `ordenesCompra.controller.js`).
- Servicios de reglas de negocio dentro del módulo (por ejemplo `ticketStateMachine.js`).

### Reglas (backend)

- Los módulos no se importan entre sí salvo por servicios explícitos (el módulo `tickets` usa su propia máquina de estados).
- Toda validación de negocio se repite en el backend; nunca confiar sólo en la app.
- Errores: `next(err)` hacia `core/middlewares/errorHandler.js`. Para errores de negocio, `res.status(...).json({ error })` o asignar `err.status`.
- Cambios de esquema: nuevo archivo numerado en `sql/`, nunca editar uno ya ejecutado.
- Autenticación: todo `/api` exige token de sesión salvo `/api/auth/login`. No hay registro desde la app: las cuentas se crean en PostgreSQL con un hash scrypt (`core/utils/passwords.js`). Nunca se aceptan hashes desde el cliente. Roles: `admin` gestiona usuarios, supervisores, empresas, áreas y contratos; `director` consulta y opera tickets. Las rutas de escritura se protegen con `autorizar('admin')` (`modules/auth/autorizacion.middleware.js`).

### Comandos (backend)

```bash
npm start      # node src/server.js
npm run dev    # con --watch
```

---

## Pendientes y advertencias

- **Expo Router**: `frontend/AGENTS.md` pide Expo Router con rutas en `src/app/`. La navegación actual usa React Navigation (`src/navigation/`). La migración no se ha hecho.
- **Secretos**: `backend/.env` está en el control de versiones. Debe sacarse del repositorio y rotar sus credenciales.
- **node_modules en Git**: el índice contiene `frontend/node_modules` (~25 000 archivos). Revisar `.gitignore` y ejecutar `git rm -r --cached`.
- **Fotos**: el alta de tickets guarda `foto` pero el envío de archivos aún no está implementado en el servidor.
- **Feriados**: `sumarDiasHabiles` no descuenta feriados (pendiente de confirmar con la Municipalidad).
- **Tickets por contrato**: el detalle de contrato no muestra tickets asociados.
