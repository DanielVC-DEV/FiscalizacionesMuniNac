# navigation — rutas de la app

Registro único de las pantallas y del stack de navegación (React Navigation, `native-stack`).

## Archivos

- [AppNavigator.tsx](AppNavigator.tsx): define las rutas `Menu`, `Resumen`, `CrearTicket`, `Contratos`, `ContratoDetalle`, `CrearContrato`, `Empresas` y `Areas`. Cada pantalla viene de su módulo.

## Cómo agregar una pantalla

1. Crear la pantalla en `modules/<modulo>/`.
2. Registrarla en `AppNavigator.tsx` con su nombre de ruta.
3. Si es una opción del menú, agregarla al arreglo `OPCIONES` de [modules/menu/MenuScreen.tsx](../modules/menu/MenuScreen.tsx) usando el mismo nombre.

Los nombres de ruta son strings: `navigation.navigate('Contratos')` debe coincidir exactamente con el nombre registrado.

La envoltura de la app (`SafeAreaProvider`, `NavigationContainer`) está en [../../App.tsx](../../App.tsx).
