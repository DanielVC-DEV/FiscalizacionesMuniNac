// Contratos y órdenes de compra, según la sección 20 y 21 del informe.

export interface OrdenCompra {
  id: string;
  codigo: string;
  monto: string;
  fecha: string;
}

export interface Contrato {
  id: string;
  idEmpresa?: string;
  idSupervisor?: number | null;
  supervisorNombre?: string | null;
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
