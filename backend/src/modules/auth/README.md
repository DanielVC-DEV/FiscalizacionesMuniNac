# modules/auth — inicio y cierre de sesión

Inicio y cierre de sesión contra PostgreSQL. No hay registro desde la app: las cuentas las crea el administrador directamente en la base. Todo `/api` (salvo `/api/auth`) exige un token de sesión válido.

## Archivos

- [auth.routes.js](auth.routes.js): `POST /api/auth/login` y `POST /api/auth/logout` (este último exige sesión).
- [auth.controller.js](auth.controller.js): `login` verifica correo y contraseña, y que la cuenta tenga rol asignado; `logout` cierra la sesión. Responde el mismo mensaje para correo inexistente o contraseña errónea.
- [sesiones.js](sesiones.js): servicio de sesiones. Genera tokens aleatorios de 32 bytes, guarda sólo su SHA-256 en `sesion` y vencen a las 8 horas.
- [autenticacion.middleware.js](autenticacion.middleware.js): lee `Authorization: Bearer <token>`, valida la sesión y deja el usuario en `req.usuario`. Responde 401 si falta o venció.
- [autorizacion.middleware.js](autorizacion.middleware.js): `autorizar(...roles)` deja pasar sólo a los roles indicados; responde 403 a los demás. Se usa en `app.js` (usuarios y supervisores, sólo `admin`) y en las rutas de empresas, contratos y áreas para las operaciones de escritura.

## Dependencias

- [core/utils/passwords.js](../../core/utils/README.md): hash scrypt y verificación en tiempo constante.
- [core/utils/validaciones.js](../../core/utils/README.md): `esEmailValido`, `esPasswordValida`, `textoValido`.
- [core/config/db.js](../../core/config/README.md): pool de PostgreSQL.
- Tablas: `usuario`, `rol`, `rol_usuario`, `sesion` (script [05_autenticacion.sql](../../../sql/05_autenticacion.sql)).

## Reglas

- Las cuentas se crean en PostgreSQL (`usuario` + `rol_usuario`) con un hash scrypt generado por [core/utils/passwords.js](../../core/utils/README.md). Nunca se guarda la contraseña en claro.
- Una cuenta sin fila en `rol_usuario` no puede iniciar sesión (403).
- Roles: `admin` gestiona usuarios, supervisores, empresas, áreas y contratos (crear, editar, eliminar). `director` consulta todo y opera tickets (crear, seguimiento, estados). Lectura de empresas, contratos y áreas es para todos los roles.
- Un usuario sin sesión no llega a ningún otro endpoint de `/api`.
