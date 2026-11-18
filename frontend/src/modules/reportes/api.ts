import { API_BASE_URL, cabeceraAutorizacion, request } from '../../core/api/client';

// Respuesta de GET /api/reportes/indicadores. Los promedios llegan como texto
// (numeric de PostgreSQL) o null cuando todavía no hay datos.
export interface IndicadoresApi {
  total: number;
  abiertos: number;
  respondidos: number;
  pendientes_revision: number;
  requieren_nueva_subsanacion: number;
  vencidos: number;
  subsanados_conforme: number;
  cerrados: number;
  tiempo_promedio_respuesta_dias: string | null;
  tiempo_promedio_cierre_dias: string | null;
  por_empresa: RepartoApi[];
  por_area: RepartoApi[];
  por_prioridad: RepartoApi[];
  por_mes: MesApi[];
  respuestas_con_dato: number;
  respuestas_en_plazo: number;
}

// Reparto de tickets por empresa, área o prioridad (máximo 8, de mayor a menor).
export interface RepartoApi {
  nombre: string;
  total: number;
  resueltos: number;
  vencidos: number;
}

// Tickets creados en el mes (aaaa-mm) y cuántos de ellos ya tienen cierre.
export interface MesApi {
  mes: string;
  creados: number;
  cerrados: number;
}

// Filtros por fecha de creación (aaaa-mm-dd). Vacío = sin filtro.
export interface FiltrosReporte {
  creada_desde?: string;
  creada_hasta?: string;
}

function consulta(filtros: FiltrosReporte): string {
  const partes = Object.entries(filtros)
    .filter(([, valor]) => !!valor)
    .map(([clave, valor]) => `${clave}=${encodeURIComponent(valor as string)}`);
  return partes.length ? `?${partes.join('&')}` : '';
}

export const reportesApi = {
  indicadores: (filtros: FiltrosReporte = {}) =>
    request<IndicadoresApi>(`/reportes/indicadores${consulta(filtros)}`),

  // Descarga el PDF y lo guarda desde el navegador. El PDF exige sesión, por eso se
  // pide con cabecera y se entrega como archivo local. Sólo disponible en la web.
  descargarPdf: async (filtros: FiltrosReporte = {}) => {
    const respuesta = await fetch(`${API_BASE_URL}/reportes/pdf${consulta(filtros)}`, {
      headers: { Accept: 'application/pdf', ...cabeceraAutorizacion() },
    }).catch(() => {
      throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
    });
    if (!respuesta.ok) {
      const cuerpo = await respuesta.json().catch(() => null);
      throw new Error(cuerpo?.error || `No se pudo generar el PDF (${respuesta.status})`);
    }
    const url = URL.createObjectURL(await respuesta.blob());
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'reporte-tickets.pdf';
    enlace.click();
    URL.revokeObjectURL(url);
  },
};
