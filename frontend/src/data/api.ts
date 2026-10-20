// La URL se puede cambiar por entorno para usar localhost, un emulador o un teléfono físico.
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export interface EmpresaApi {
  id_empresa: number;
  razon_social: string;
  rut: string;
  id_area: number;
  area_nombre?: string;
}

export interface AreaApi {
  id_area: number;
  nombre: string;
}

export interface UsuarioApi {
  id_usuario: number;
  nombre: string;
  email: string;
  id_empresa: number | null;
  rol: string | null;
}

export interface ContratoApi {
  id_contratos: number;
  nombre: string;
  fecha_inicio: string;
  fecha_termino: string;
  dia_respuesta: number | null;
  id_empresa: number;
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Todas las llamadas comparten la misma URL base y encabezados JSON.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  // Las respuestas 204 no traen JSON; en las demás, un cuerpo inválido se trata como vacío.
  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  // Propaga el mensaje del servidor para que la pantalla pueda informar el fallo.
  if (!response.ok) {
    throw new Error(payload?.error || `Error de conexión (${response.status})`);
  }

  return payload as T;
}

export const api = {
  // Lecturas de catálogos y recursos usados por los formularios.
  listarEmpresas: () => request<EmpresaApi[]>('/empresas'),
  listarAreas: () => request<AreaApi[]>('/areas'),
  listarUsuarios: () => request<UsuarioApi[]>('/usuarios'),
  listarSupervisores: (idEmpresa: number) =>
    request<Pick<UsuarioApi, 'id_usuario' | 'nombre' | 'email'>[]>(`/empresas/${idEmpresa}/supervisores`),
  listarContratos: () => request<ContratoApi[]>('/contratos'),
  obtenerContrato: (id: string) => request<ContratoApi>(`/contratos/${id}`),
  // Escrituras persistentes; se serializa el objeto para enviarlo como JSON.
  crearContrato: (body: Record<string, unknown>) =>
    request<{ id_contratos: number }>('/contratos', { method: 'POST', body: JSON.stringify(body) }),
  agregarOrdenCompra: (id: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/contratos/${id}/ordenes-compra`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listarTickets: () => request<TicketApi[]>('/tickets'),
  crearTicket: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>('/tickets', { method: 'POST', body: JSON.stringify(body) }),
};