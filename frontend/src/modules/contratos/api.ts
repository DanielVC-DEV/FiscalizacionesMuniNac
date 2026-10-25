import { request } from '../../core/api/client';

export interface ContratoApi {
  id_contratos: number;
  nombre: string;
  fecha_inicio: string;
  fecha_termino: string;
  dia_respuesta: number | null;
  id_empresa: number;
  id_supervisor: number | null;
  supervisor_nombre?: string | null;
  supervisor_email?: string | null;
  empresa_nombre: string;
  empresa_rut: string;
  ordenes_compra?: {
    id_compra: number;
    monto: string;
    fecha_compra: string;
  }[];
  prioridades?: {
    id_prioridad_contrato: number;
    nombre_prioridad: string;
    dias_habiles: number;
  }[];
}

export const contratosApi = {
  listar: () => request<ContratoApi[]>('/contratos'),
  obtener: (id: string) => request<ContratoApi>(`/contratos/${id}`),
  // Escrituras persistentes; se serializa el objeto para enviarlo como JSON.
  crear: (body: Record<string, unknown>) =>
    request<{ id_contratos: number }>('/contratos', { method: 'POST', body: JSON.stringify(body) }),
  agregarOrdenCompra: (id: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/contratos/${id}/ordenes-compra`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
