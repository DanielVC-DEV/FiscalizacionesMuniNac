// Tipos y reglas fijas del negocio, según el Informe de Requerimientos.
// Esto no es "data de prueba": son reglas definidas por el informe
// (sección 8), no inventos nuestros.

export type Prioridad = 'Urgente' | 'Muy alta' | 'Alta' | 'Normal' | 'Baja';

export const PRIORIDADES: Prioridad[] = ['Urgente', 'Muy alta', 'Alta', 'Normal', 'Baja'];

// Días hábiles de plazo por prioridad (tabla de la sección 8 del informe).
export const DIAS_PLAZO_POR_PRIORIDAD: Record<Prioridad, number> = {
  Urgente: 1,
  'Muy alta': 2,
  Alta: 3,
  Normal: 5,
  Baja: 10,
};

// Contratos y órdenes de compra, según la sección 20 y 21 del informe.

export interface Empresa {
  rut: string;
  nombre: string;
}

export interface OrdenCompra {
  id: string;
  codigo: string;
  monto: string;
  fecha: string;
}

export interface Contrato {
  id: string;
  // Campos mínimos que pide la sección 20 del informe:
  nombre: string;
  rutEmpresa: string;
  nombreEmpresa: string;
  fechaInicio: string;
  fechaTermino: string;
  diasRespuestaTicket: number;
  // Sección 21: un contrato puede tener una o varias órdenes de compra.
  ordenesCompra: OrdenCompra[];
}

// Estados del ticket, sección 13 del informe. "VENCIDO" no se guarda como
// estado propio: es una condición derivada de comparar la fecha de
// vencimiento con hoy (ver esFechaPasada en utils/fechas.ts).
export type EstadoTicket =
  | 'ABIERTO'
  | 'RESPONDIDO'
  | 'REQUIERE_NUEVA_SUBSANACION'
  | 'SUBSANADO_CONFORME'
  | 'CERRADO';

export interface Ticket {
  id: string;
  contrato: string;
  area: string;
  supervisor: string;
  prioridad: Prioridad;
  descripcion: string;
  fotos: string[];
  direccion: string;
  sector: string;
  referencia: string;
  coordenadas: string;
  copiaA: string[];
  estado: EstadoTicket;
  fechaCreacion: string;
  diasPlazo: number;
  fechaVencimiento: string;
}
