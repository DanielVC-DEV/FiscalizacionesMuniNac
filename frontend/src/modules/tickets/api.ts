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

export const ticketsApi = {
  listar: () => request<TicketApi[]>('/tickets'),
  crear: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/tickets', { method: 'POST', body: JSON.stringify(body) }),
};
