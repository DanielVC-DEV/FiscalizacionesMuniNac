# navigation — rutas de la app

Registro único de las pantallas y del stack de navegación (React Navigation, `native-stack`).

## Archivos

- [AppNavigator.tsx](AppNavigator.tsx): define dos grupos de rutas según la sesión (`useSesion()` de [modules/auth](../modules/auth/README.md)):
  - Sin sesión: `Login`. Es la pantalla inicial.
  - Con sesión (todos los roles): `Menu`, `Resumen` y `TicketDetalle`.
  - Sólo admin y director: `CrearTicket`, `Indicadores`, `Contratos` y `ContratoDetalle`. El supervisor de empresa no tiene esas rutas.
  - Sólo con rol `admin`: `CrearContrato`, `Empresas`, `Areas`, `Supervisores` y `Destinatarios`. Si el rol no es admin, esas rutas no existen para la navegación.
- [ShellWeb.tsx](ShellWeb.tsx): marco de la web (ventanas de 900 px o más): menú lateral izquierdo en todas las pantallas con sesión y la pantalla a todo el ancho a la derecha. `conShellWeb(Pantalla)` envuelve cada pantalla en `AppNavigator`. En el celular no hace nada.

## Cómo agregar una pantalla

1. Crear la pantalla en `modules/<modulo>/`.
2. Registrarla en `AppNavigator.tsx` con su nombre de ruta.
3. Si es una opción del menú, agregarla a `OPCIONES` u `OPCIONES_GESTION` de [modules/menu/opciones.tsx](../modules/menu/opciones.tsx) usando el mismo nombre.

Los nombres de ruta son strings: `navigation.navigate('Contratos')` debe coincidir exactamente con el nombre registrado.

La envoltura de la app (`SafeAreaProvider`, `NavigationContainer`) está en [../../App.tsx](../../App.tsx).
