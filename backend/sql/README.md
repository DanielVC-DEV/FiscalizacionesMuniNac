# backend/sql — esquema de base de datos

Scripts en orden. Cada uno asume que los anteriores ya se ejecutaron.

| Archivo | Contenido |
|---|---|
| [01_schema.sql](01_schema.sql) | Esquema base: áreas, empresas, contratos, órdenes de compra, roles, usuarios, observaciones y tickets. |
| [02_ficha_empresa_contrato.sql](02_ficha_empresa_contrato.sql) | Campos de la ficha de empresa y de contrato; renombra `empresas.nombre` a `razon_social`. |
| [03_contrato_prioridad_respuesta.sql](03_contrato_prioridad_respuesta.sql) | Número de contrato automático, prioridades por contrato (con triggers), ticket ligado a contrato y tabla `respuesta`. |
| [04_supervisor_contrato.sql](04_supervisor_contrato.sql) | Supervisor asignado a cada contrato (`contratos.id_supervisor`). |

Módulos que dependen de estos scripts: [contratos](../src/modules/contratos/README.md) y [tickets](../src/modules/tickets/README.md).
