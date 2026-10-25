import { request } from '../../core/api/client';

export interface EmpresaApi {
  id_empresa: number;
  razon_social: string;
  rut: string;
  id_area: number;
  area_nombre?: string;
}

export interface SupervisorApi {
  id_usuario: number;
  nombre: string;
  email: string;
}

export const empresasApi = {
  listar: () => request<EmpresaApi[]>('/empresas'),
  crear: (body: Record<string, unknown>) =>
    request<EmpresaApi>('/empresas', { method: 'POST', body: JSON.stringify(body) }),
  // Usuarios con rol supervisor_empresa de una empresa.
  listarSupervisores: (idEmpresa: number) =>
    request<SupervisorApi[]>(`/empresas/${idEmpresa}/supervisores`),
};
