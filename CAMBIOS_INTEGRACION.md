# Cambios de integración frontend-backend

## Cliente API

- Se agregó `frontend/src/data/api.ts` como cliente REST para empresas, áreas, usuarios, supervisores, contratos y tickets.
- La URL base se configura con `EXPO_PUBLIC_API_URL`. El valor predeterminado es `http://localhost:3000/api`.
- Los errores HTTP se convierten en mensajes que pueden mostrarse en la interfaz.

## Empresas y contratos

- La pantalla de empresas consulta `GET /api/empresas` en lugar de mostrar datos de ejemplo.
- El formulario de contratos consulta las empresas existentes y envía `POST /api/contratos` con el ID de empresa y las fechas en formato ISO.
- Las órdenes de compra se guardan con monto y fecha usando `POST /api/contratos/:id/ordenes-compra`.
- El listado de contratos se actualiza desde el servidor al abrirse.
- El backend agrega al listado de contratos el RUT de la empresa y las órdenes de compra para que la app pueda mostrarlos.

## Tickets

- El resumen consulta `GET /api/tickets` al abrirse y muestra los tickets guardados en el servidor.
- El formulario carga los contratos, los supervisores asociados a la empresa y las prioridades definidas para el contrato.
- La creación envía `id_contrato`, `id_usuario` e `id_prioridad`, junto con descripción, plazo y ubicación. El backend obtiene la empresa a partir del contrato y devuelve el nombre del contrato al listado.
- Se alinearon los controladores de tickets con el esquema activo de la migración `sql/03_contrato_prioridad_respuesta.sql`.
- La pantalla de detalle muestra el identificador de la orden de compra cuando el esquema no proporciona un código.

## Configuración y documentación

- Se agregó `frontend/.env.example` con la URL local predeterminada.
- Se actualizó `README.md` con instrucciones para navegador, emulador Android y teléfono físico, además del requisito de la migración `03` para las operaciones de tickets.
- Se agregó un `.gitignore` para dependencias, cachés de Expo y archivos `.env` locales.
- Se configuró ESLint para el frontend y se incorporaron sus dependencias de desarrollo.
- Se amplió el tipo de `Card` para aceptar arreglos de estilos de React Native; esto resolvió un error que impedía completar la comprobación de TypeScript.

## Limitaciones actuales

- La creación de tickets necesita que la empresa tenga un supervisor registrado. En la base probada no había supervisores disponibles.
- El backend aún no implementa carga de fotos, por lo que las fotos seleccionadas no se envían ni persisten.
- La tabla de órdenes de compra no tiene un campo para el código; se guardan monto y fecha.
- Las ubicaciones se guardan como un único texto; sector, referencia y coordenadas no se almacenan por separado.

## Verificación realizada

- `npm exec -- expo lint`: correcto, sin errores ni advertencias.
- `npm exec -- tsc --noEmit`: correcto.
- `node --check` en los controladores modificados: correcto.
- Se consultaron en vivo `/health`, empresas, contratos, detalle de contrato, supervisores y tickets. Las rutas respondieron; tickets devolvió una lista vacía y supervisores no devolvió registros.
- La app web compiló y mostró el contrato existente y la empresa cargados desde el backend.

## Ejecución local

- Frontend: `http://localhost:8081`
- Backend: `http://localhost:3000`
- Para cambiar la dirección de la API, crea `frontend/.env` y define `EXPO_PUBLIC_API_URL`.
