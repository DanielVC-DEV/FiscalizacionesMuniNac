# modules/auth — acceso a la app

Pantalla de inicio de sesión y la sesión activa en memoria. Es lo primero que ve el usuario: sin sesión, la navegación muestra sólo `Login`. Las cuentas no se registran desde la app; las crea el administrador en PostgreSQL.

## Archivos

- [LoginScreen.tsx](LoginScreen.tsx): correo y contraseña. Llama a `authApi.login` y, si funciona, inicia la sesión.
- [api.ts](api.ts): endpoints `login` y `logout`, y el tipo `AuthApi` de la respuesta.
- [types.ts](types.ts): tipo `Usuario` de la sesión.
- [store.ts](store.ts): sesión en memoria. `iniciarSesion`, `cerrarSesion`, el hook `useSesion()` y `esAdministrador(usuario)`, que decide qué opciones de administración se muestran. El token se pasa a [core/api/client.ts](../../core/api/README.md) y no se guarda en el teléfono: al cerrar la app hay que volver a iniciar sesión.
- [components/](components/README.md): `PantallaAcceso` (marco común) y `CampoTexto` (campo con mostrar/ocultar contraseña).

## Depende de

- [core/api](../../core/api/README.md), [core/ui/Button](../../core/ui/Button.tsx), [core/theme](../../core/theme/README.md).
- Lo usan [navigation/AppNavigator.tsx](../../navigation/AppNavigator.tsx) (decide qué pantallas mostrar) y [menu/MenuScreen.tsx](../menu/MenuScreen.tsx) (saludo y cerrar sesión).
