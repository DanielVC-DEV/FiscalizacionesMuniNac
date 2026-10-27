import { request } from '../../core/api/client';
import type { Usuario } from './types';

// Respuesta de /api/auth/login.
export interface AuthApi {
  token: string;
  expira_en: string;
  usuario: Usuario;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthApi>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<null>('/auth/logout', { method: 'POST' }),
};
