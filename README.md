# FiscalizacionesMuniNac

Plataforma de Gestión de Tickets de Fiscalización de Contratos — Municipalidad de Nacimiento.

## Estructura del proyecto

```
FiscalizacionesMuniNac/
├── backend/     API en Node.js + Express + PostgreSQL
└── frontend/    App en React Native (Expo) — se puede correr en el navegador
```

## 1. Base de datos

Los scripts están en `backend/sql/`, en orden:

| Archivo | Qué hace | Estado |
|---|---|---|
| `01_schema.sql` | Crea todas las tablas base (area, empresas, contratos, orden_de_compra, rol, usuario, rol_usuario, observaciones, ticket) | ✅ Confirmado |
| `02_ficha_empresa_contrato.sql` | Agrega los campos de la ficha de empresa y contrato (razón social, dirección, administrador de contrato, supervisor contraparte, etc.) | ✅ Confirmado |
| `03_contrato_prioridad_respuesta.sql` | Prioridades por contrato, `ticket.id_contrato` con auto-asignación de empresa/supervisor, tabla `respuesta`, nomenclatura de número de contrato | ⏳ **Pendiente de confirmar con tu supervisor** |

Ejecuta cada uno con:
```bash
psql -U postgres -d fiscalizacion_contratos -f backend/sql/01_schema.sql
psql -U postgres -d fiscalizacion_contratos -f backend/sql/02_ficha_empresa_contrato.sql
# el 03 lo corres cuando tu supervisor confirme esos cambios
```

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env     # y edita DATABASE_URL con tu usuario/contraseña reales
npm run dev               # levanta en http://localhost:3000
```

Ya probado: instala sin errores y el servidor responde en `/health`.

**Importante:** el detalle de contratos y las operaciones de tickets (listar, crear, cambiar estado y respuestas) requieren `sql/03`, porque usan `ticket.id_contrato` y las prioridades por contrato. Si todavía no ejecutas esa migración, esas rutas fallarán. Áreas, roles, empresas, usuarios y el listado general de contratos funcionan con `01` + `02`.

### Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/areas`, `/api/roles` | Catálogos |
| GET/POST | `/api/empresas` | Listar / crear empresa |
| GET | `/api/empresas/:id/supervisores` | Usuarios con rol supervisor_empresa de esa empresa |
| PATCH | `/api/empresas/:id/supervisor-contraparte` | Asignar el supervisor oficial de la empresa |
| GET/POST | `/api/contratos` | Listar / crear contrato (con sus órdenes de compra y prioridades) |
| POST | `/api/contratos/:id/ordenes-compra` | Agregar una orden de compra |
| GET/POST | `/api/usuarios` | Listar / crear usuario (+ asignar rol en la misma operación) |
| GET/POST | `/api/tickets` | Listar / crear ticket (crea la observación 1:1 en la misma transacción) |
| PATCH | `/api/tickets/:id/estado` | Cambiar estado (valida transiciones permitidas) |

## 3. Frontend (Expo, navegador o dispositivo)

El proyecto ya trae el script para eso en `package.json`. Solo falta instalar las dependencias que Expo necesita específicamente para correr en navegador (no vienen por defecto en un proyecto pensado para celular):

```bash
cd frontend
npm install
npx expo install react-dom react-native-web @expo/metro-runtime
npm run web
```

Esto abre el proyecto en `http://localhost:8081` (o el puerto que indique la consola) directo en tu navegador — no necesitas la app de Expo Go ni un celular conectado.

El frontend se conecta a la API en `http://localhost:3000/api` por defecto. Para cambiarla, crea `frontend/.env` usando `frontend/.env.example` como referencia y configura `EXPO_PUBLIC_API_URL`. En un teléfono físico, usa la IP local de tu computador (por ejemplo, `http://192.168.1.20:3000/api`) y permite el puerto 3000 en el firewall; `localhost` en el teléfono apunta al propio teléfono. En el emulador Android normalmente se usa `http://10.0.2.2:3000/api`.

Empresas, contratos y tickets se leen y guardan mediante la API. El formulario de tickets usa supervisores registrados para la empresa del contrato seleccionado. El esquema actual todavía no vincula directamente un ticket a un contrato y no incluye carga de archivos; esos datos no se persisten. Las órdenes de compra guardan monto y fecha, ya que el esquema actual no tiene un campo para su código.
