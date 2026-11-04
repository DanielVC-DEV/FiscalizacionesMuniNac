import { request } from '../../core/api/client';

export interface DestinatarioApi {
  id_destinatario: number;
  email: string;
  nombre: string | null;
  activo: boolean;
}

export const notificacionesApi = {
  listarDestinatarios: () => request<DestinatarioApi[]>('/notificaciones/destinatarios'),
  crearDestinatario: (body: { email: string; nombre?: string }) =>
    request<DestinatarioApi>('/notificaciones/destinatarios', { method: 'POST', body: JSON.stringify(body) }),
  // Activar o desactivar sin perder el registro.
  cambiarActivo: (id: number, activo: boolean) =>
    request<DestinatarioApi>(`/notificaciones/destinatarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    }),
  eliminarDestinatario: (id: number) =>
    request<null>(`/notificaciones/destinatarios/${id}`, { method: 'DELETE' }),
};
