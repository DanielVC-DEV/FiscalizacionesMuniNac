import { request } from '../../core/api/client';

export interface AreaApi {
  id_area: number;
  nombre: string;
}

export const areasApi = {
  listar: () => request<AreaApi[]>('/areas'),
  crear: (body: { nombre: string }) =>
    request<AreaApi>('/areas', { method: 'POST', body: JSON.stringify(body) }),
};
