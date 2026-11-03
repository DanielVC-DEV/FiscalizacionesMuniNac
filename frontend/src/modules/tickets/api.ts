import { request } from '../../core/api/client';

export interface TicketApi {
  id_ticket: number;
  numero: string;
  prioridad: string;
  estado: string;
  fecha_hora_creacion: string;
  plazo_subsanar: number | null;
  fecha_vencimiento: string;
  contrato_nombre: string;
  empresa_nombre: string;
  supervisor_nombre: string;
  descripcion: string;
  foto: string | null;
  ubicacion: string | null;
}

export interface RespuestaApi {
  id_respuesta: number;
  comentario: string;
  fecha: string;
  usuario_nombre: string;
}

export interface ActuacionApi {
  id_actuacion: number;
  tipo: string;
  fecha: string;
  descripcion: string | null;
  usuario_nombre: string | null;
}

export interface RespuestaCreadaApi {
  aviso?: string;
}

export interface TicketDetalleApi extends TicketApi {
  conformidad_fecha: string | null;
  comentario_conformidad: string | null;
  respuestas: RespuestaApi[];
  historial: ActuacionApi[];
}

export const ticketsApi = {
  listar: () => request<TicketApi[]>('/tickets'),
  crear: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/tickets', { method: 'POST', body: JSON.stringify(body) }),
  obtener: (id: number) => request<TicketDetalleApi>(`/tickets/${id}`),
  responder: (id: number, comentario: string) =>
    request<RespuestaCreadaApi>(`/tickets/${id}/respuestas`, {
      method: 'POST',
      body: JSON.stringify({ comentario }),
    }),
  solicitarSubsanacion: (id: number, comentario: string) =>
    request(`/tickets/${id}/solicitar-subsanacion`, {
      method: 'POST',
      body: JSON.stringify({ comentario }),
    }),
  darConformidad: (id: number, comentario?: string) =>
    request(`/tickets/${id}/conformidad`, {
      method: 'POST',
      body: JSON.stringify({ comentario }),
    }),
  cerrar: (id: number, comentario?: string) =>
    request(`/tickets/${id}/cerrar`, {
      method: 'POST',
      body: JSON.stringify({ comentario }),
    }),
};
