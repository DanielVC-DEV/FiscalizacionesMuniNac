# Autenticación y roles

Guía para el equipo: cómo funciona el inicio de sesión, qué puede hacer cada rol y cómo crear cuentas.

## Resumen

- La app abre en la pantalla de **Iniciar sesión**. Sin sesión no se ve nada más.
- Las cuentas **no se registran desde la app**. Se crean directamente en PostgreSQL.
- La sesión dura **8 horas**. Al cerrar la app hay que volver a entrar (el token no se guarda en el teléfono).
- Todo `/api` exige sesión, salvo `/api/auth/login`.

## Roles

| Rol | Puede entrar | Qué puede hacer |
|---|---|---|
| `admin` | Sí | Todo: usuarios, supervisores, empresas, áreas, contratos y tickets. |
| `director` | Sí | Consultar todo, crear y dar seguimiento a tickets, cambiar estados. No gestiona usuarios, supervisores, empresas, áreas ni contratos. |
| `supervisor_empresa` | **No** | Existe en la base para asignarlo a contratos y empresas. El login lo rechaza con 403. |

Detalle de permisos en el backend:

- `/api/usuarios` y `/api/supervisores`: sólo `admin`, en todas sus operaciones.
- Crear empresas (`POST /api/empresas`), asignar supervisor de contraparte, crear áreas (`POST /api/areas`) y todas las operaciones de escritura de contratos: sólo `admin`.
- Consultas de empresas, áreas y contratos: todos los roles que pueden entrar.
- Tickets: todos los roles que pueden entrar.

En la app, el menú y las pantallas de administración sólo aparecen para `admin`. Pero la protección real está en el backend: aunque alguien llame a la API directamente, el director recibe 403.

## Crear una cuenta

Las cuentas se crean en PostgreSQL. Son dos pasos.

**1. Generar el hash de la contraseña.** Desde la carpeta `backend`, reemplaza `CONTRASEÑA` por la contraseña elegida:

```bash
node -e "console.log(require('./src/core/utils/passwords').hashPassword(process.argv[1]))" "CONTRASEÑA"
```

El resultado empieza con `scrypt$`. Nunca guardes la contraseña en claro en la base ni en el repositorio.

**2. Insertar el usuario y su rol** en el Query Tool, reemplazando el hash y el correo:

```sql
INSERT INTO usuario (nombre, email, password_hash)
VALUES ('Nombre Apellido', 'correo@municipalidad.cl', 'HASH_GENERADO');

INSERT INTO rol_usuario (id_rol, id_usuario)
SELECT r.id_rol, u.id_usuario
FROM rol r
JOIN usuario u ON u.email = 'correo@municipalidad.cl'
WHERE r.nombre = 'director';   -- o 'admin'
```

Reglas:

- El correo debe escribirse **en minúsculas**: el login lo convierte a minúsculas antes de buscar.
- Cada usuario tiene **un solo rol** (`rol_usuario` es 1 a 1).
- Si el usuario no tiene fila en `rol_usuario`, el login responde "Tu cuenta no tiene un rol asignado".

## Cómo correr el sistema

Backend (desde `backend/`):

```bash
npm install
npm start
```

Debe responder en `http://localhost:3000/health` con `{"ok":true}`. La base de datos se configura en `backend/.env` (`DATABASE_URL`) y el puerto con `PORT`.

Frontend (desde `frontend/`):

```bash
npx expo start
```

Si se prueba desde un teléfono (Expo Go), `localhost` apunta al teléfono y no a la PC. Define la IP de tu computador en `frontend/.env`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api
```

Reinicia Expo después de cambiarla.

## Problemas frecuentes

| Mensaje en la app | Causa probable |
|---|---|
| "No se pudo conectar con el servidor" | El backend no está corriendo, o la URL de la API no es la correcta. |
| "Correo o contraseña incorrectos" | Correo mal escrito (recuerda: minúsculas), o contraseña distinta a la usada al generar el hash. |
| "Tu cuenta no tiene un rol asignado" | Falta la fila en `rol_usuario`. Ejecuta el segundo `INSERT` del paso 2. |
| "Tu rol no tiene acceso a esta aplicación" | La cuenta es `supervisor_empresa`. Por diseño no puede entrar. |
| "Tu sesión venció" | Pasaron más de 8 horas. Vuelve a iniciar sesión. |

## Archivos principales

- Backend: [backend/src/modules/auth/](backend/src/modules/auth/README.md) (login, sesiones, middlewares de sesión y rol).
- Hash de contraseñas: [backend/src/core/utils/passwords.js](backend/src/core/utils/passwords.js).
- Tabla de sesiones: [backend/sql/05_autenticacion.sql](backend/sql/05_autenticacion.sql).
- Frontend: [frontend/src/modules/auth/](frontend/src/modules/auth/README.md) (pantalla de login, sesión en memoria, encabezado con cerrar sesión).
- Navegación según sesión y rol: [frontend/src/navigation/AppNavigator.tsx](frontend/src/navigation/AppNavigator.tsx).

## Pendientes conocidos

- **Sin límite de intentos** en el login. Hay que agregar limitación por IP y por correo antes de producción.
- **CORS abierto** a cualquier origen.
- Los errores 500 pueden mostrar detalles de la base de datos (ver `backend/src/core/middlewares/errorHandler.js`).
- Cuando vence la sesión, las pantallas muestran un error genérico en vez de volver al login.
- No hay pruebas automáticas del login ni de los permisos por rol.
