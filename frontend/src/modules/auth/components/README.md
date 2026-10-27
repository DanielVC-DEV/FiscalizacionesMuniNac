# modules/auth/components — piezas del acceso

Componentes que sólo usan las pantallas de inicio de sesión y registro.

## Archivos

- [PantallaAcceso.tsx](PantallaAcceso.tsx): marco común de Login y Registro. Franja azul, logo institucional, tarjeta con título y formulario, y pie con el aviso de uso restringido.
- [CampoTexto.tsx](CampoTexto.tsx): campo con etiqueta y borde que resalta al enfocar. Con `esPassword` agrega el botón Mostrar/Ocultar.
- [SesionHeader.tsx](SesionHeader.tsx): encabezado de las pantallas con sesión. Muestra la inicial del usuario (A si es administrador, U en los demás roles) y el botón Cerrar sesión. Lo usan las pantallas de la app en lugar de `core/ui/Header` directo.

Volver al [README de auth](../README.md).
