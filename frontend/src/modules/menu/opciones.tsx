import { esAdministrador, esMunicipal, useSesion } from '../auth/store';
import { IconoBarras, IconoTicket, IconoDocumento, IconoEdificio } from './components/IconosMenu';

// Destinos del menú principal. "destino" es el nombre de la ruta registrada
// en navigation/AppNavigator.tsx.
export const OPCIONES = [
  {
    titulo: 'Resúmenes',
    descripcion: 'Estado de los tickets',
    destino: 'Resumen',
    glifo: <IconoBarras />,
  },
  {
    titulo: 'Indicadores',
    descripcion: 'Métricas y reporte PDF',
    destino: 'Indicadores',
    glifo: <IconoBarras />,
  },
] as const;

export const OPCIONES_GESTION = [
  {
    titulo: 'Tickets',
    descripcion: 'Crear una fiscalización',
    destino: 'CrearTicket',
    glifo: <IconoTicket />,
  },
  {
    titulo: 'Áreas',
    descripcion: 'Administrar áreas',
    destino: 'Areas',
    glifo: <IconoDocumento />,
  },
  {
    titulo: 'Empresas',
    descripcion: 'Empresas contratistas',
    destino: 'Empresas',
    glifo: <IconoEdificio />,
  },
  {
    titulo: 'Contratos',
    descripcion: 'Ver y crear contratos',
    destino: 'Contratos',
    glifo: <IconoDocumento />,
  },
] as const;

// Destinos que sólo ve el administrador (ver auth/store.ts).
const DESTINOS_ADMIN: string[] = ['Empresas', 'Areas'];
// Destinos de usuarios municipales: el supervisor de empresa sólo ve "Resumen".
const DESTINOS_MUNICIPALES: string[] = ['CrearTicket', 'Contratos', 'Indicadores'];

// Opciones del menú visibles para el rol de la sesión activa (principales y de
// gestión). Las usan el menú principal y el menú lateral de la web.
export function useOpcionesMenu() {
  const sesion = useSesion();
  const esAdmin = esAdministrador(sesion?.usuario);
  const municipal = esMunicipal(sesion?.usuario);
  const visible = (opcion: { destino: string }) => {
    if (DESTINOS_ADMIN.includes(opcion.destino)) return esAdmin;
    if (DESTINOS_MUNICIPALES.includes(opcion.destino)) return municipal;
    return true;
  };
  return {
    principales: OPCIONES.filter(visible),
    gestion: OPCIONES_GESTION.filter(visible),
  };
}
