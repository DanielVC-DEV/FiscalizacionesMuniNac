import { request } from '../../core/api/client';

export interface SupervisorApi {
  id_usuario: number;
  nombre: string;
  email: string;
  id_empresa: number | null;
  empresa_nombre?: string | null;
}

export const supervisoresApi = {
  listar: () => request<SupervisorApi[]>('/supervisores'),
  crear: (body: { nombre: string; email: string; id_empresa: number }) =>
    request<SupervisorApi>('/supervisores', { method: 'POST', body: JSON.stringify(body) }),
};
