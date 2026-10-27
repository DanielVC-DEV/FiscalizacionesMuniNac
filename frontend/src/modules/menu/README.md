# modules/menu — menú principal

Pantalla de inicio con una grilla de accesos a los demás módulos.

## Archivos

- [MenuScreen.tsx](MenuScreen.tsx): pantalla principal. Define `OPCIONES` (título, descripción y ruta destino), el logo de bienvenida. El encabezado (usuario y Cerrar sesión) viene de [auth/components/SesionHeader](../auth/components/SesionHeader.tsx). Oculta Empresas, Áreas y Supervisores si el rol no es `admin` (`DESTINOS_ADMIN`).
- [components/IconosMenu.tsx](components/IconosMenu.tsx): glifos hechos con `View` (`IconoBarras`, `IconoTicket`, `IconoDocumento`, `IconoEdificio`). Ver [components/README.md](components/README.md).

## Depende de

- [core/ui/Header](../../core/ui/Header.tsx) y [core/ui/Button](../../core/ui/Button.tsx)
- [core/theme](../../core/theme/README.md)
- [auth/store](../auth/store.ts) (sesión activa y cierre de sesión)
- Rutas registradas en [navigation/AppNavigator.tsx](../../navigation/AppNavigator.tsx)
