import { API_BASE_URL, request } from '../../core/api/client';

export interface EnlaceApi {
  id_consulta: number;
  creada_en: string;
  expira_en: string;
  revocada_en?: string | null;
}

// Respuesta al crear: el token sólo llega esta vez (en la base se guarda su hash).
export interface EnlaceCreadoApi extends EnlaceApi {
  token: string;
  ruta: string;
}

// Lo que ve quien abre el enlace: sólo lectura y sin nombres de usuarios internos.
export interface ConsultaPublicaApi {
  numero: string;
  estado: string;
  prioridad: string;
  empresa_nombre: string;
  area_nombre: string | null;
  contrato_nombre: string;
  fecha_creacion: string;
  fecha_vencimiento: string;
  fecha_cierre: string | null;
  descripcion: string;
  ubicacion: { direccion: string | null; sector: string | null; referencia: string | null };
  respuestas: { comentario: string; fecha: string }[];
  historial: { tipo: string; fecha: string; descripcion: string | null }[];
}

export const consultaApi = {
  crearEnlace: (idTicket: number, diasVigencia = 30) =>
    request<EnlaceCreadoApi>(`/consulta/tickets/${idTicket}/enlaces`, {
      method: 'POST',
      body: JSON.stringify({ dias_vigencia: diasVigencia }),
    }),
  listarEnlaces: (idTicket: number) => request<EnlaceApi[]>(`/consulta/tickets/${idTicket}/enlaces`),
  revocarEnlace: (idEnlace: number) =>
    request<EnlaceApi>(`/consulta/enlaces/${idEnlace}`, { method: 'DELETE' }),
  // Ruta pública: no necesita sesión.
  consultarPublica: (token: string) =>
    request<ConsultaPublicaApi>(`/consulta/publica/${encodeURIComponent(token)}`),
};

// Dirección que se entrega a quien debe consultar: la página pública de la web.
export function urlConsultaPublica(token: string): string {
  const ruta = `/consulta/${encodeURIComponent(token)}`;
  const appConfigurada = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/+$/, '');
  if (appConfigurada) {
    const baseApp = appConfigurada.endsWith('/empresa') ? appConfigurada : `${appConfigurada}/empresa`;
    return `${baseApp}${ruta}`;
  }

  if (typeof window !== 'undefined') {
    const prefijoWeb = window.location.pathname.startsWith('/empresa') ? '/empresa' : '';
    return `${window.location.origin}${prefijoWeb}${ruta}`;
  }

  return `${API_BASE_URL.replace(/\/api$/, '')}/empresa${ruta}`;
}
