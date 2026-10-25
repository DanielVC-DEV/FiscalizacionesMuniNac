# modules/menu — menú principal

Pantalla de inicio con una grilla de accesos a los demás módulos.

## Archivos

- [MenuScreen.tsx](MenuScreen.tsx): pantalla principal. Define `OPCIONES` (título, descripción y ruta destino) y el logo de bienvenida.
- [components/IconosMenu.tsx](components/IconosMenu.tsx): glifos hechos con `View` (`IconoBarras`, `IconoTicket`, `IconoDocumento`, `IconoEdificio`). Ver [components/README.md](components/README.md).

## Depende de

- [core/ui/Header](../../core/ui/Header.tsx)
- [core/theme](../../core/theme/README.md)
- Rutas registradas en [navigation/AppNavigator.tsx](../../navigation/AppNavigator.tsx)
