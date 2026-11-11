# modules/menu — menú principal

Pantalla de inicio con una grilla de accesos a los demás módulos.

## Archivos

- [MenuScreen.tsx](MenuScreen.tsx): pantalla principal. Usa los accesos de `opciones.tsx` y el menú desplegable “Creación y administración”, que agrupa Tickets, Áreas, Empresas y Contratos (en ese orden y dos columnas) según los permisos del rol. El encabezado (usuario y Cerrar sesión) viene de [auth/components/SesionHeader](../auth/components/SesionHeader.tsx). La gestión de notificaciones y supervisores no tiene acceso desde este menú.
- [opciones.tsx](opciones.tsx): lista de accesos (principales y de gestión) y `useOpcionesMenu()`, que los filtra por rol. Lo usan el menú y [navigation/ShellWeb](../../navigation/ShellWeb.tsx).
- [components/BarraLateral.tsx](components/BarraLateral.tsx): menú lateral izquierdo de la vista web (desde 900 px de ancho), con accesos principales, el desplegable “Creación y administración” y la sesión.
- [components/IconosMenu.tsx](components/IconosMenu.tsx): glifos hechos con `View` (`IconoBarras`, `IconoTicket`, `IconoDocumento`, `IconoEdificio`). Ver [components/README.md](components/README.md).

## Depende de

- [core/ui/Header](../../core/ui/Header.tsx) y [core/ui/Button](../../core/ui/Button.tsx)
- [core/theme](../../core/theme/README.md)
- [auth/store](../auth/store.ts) (sesión activa y cierre de sesión)
- Rutas registradas en [navigation/AppNavigator.tsx](../../navigation/AppNavigator.tsx)
