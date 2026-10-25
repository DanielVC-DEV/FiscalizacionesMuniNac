import { useSyncExternalStore } from 'react';
import { fechaDesdeApi } from '../../core/utils/fechas';
import { Ticket } from './types';
import { ticketsApi, TicketApi } from './api';

// Store en memoria de tickets: conserva la última respuesta de la API y
// notifica a las pantallas (resumen, creación) cuando cambia.

let tickets: Ticket[] = [];
const listeners = new Set<() => void>();

function emitir() {
  // Actualiza las pantallas que están observando la lista de tickets.
  listeners.forEach((listener) => listener());
}

export function getTickets(): Ticket[] {
  return tickets;
}

export function addTicket(ticket: Ticket) {
  // Inserta solo en el cache en memoria; la persistencia debe hacerse por ticketsApi.crear.
  tickets = [...tickets, ticket];
  emitir();
}

function normalizarTicket(ticket: TicketApi): Ticket {
  // Completa el modelo de pantalla con los campos disponibles en el esquema actual.
  return {
    id: ticket.numero,
    contrato: ticket.contrato_nombre,
    area: '',
    supervisor: ticket.supervisor_nombre,
    prioridad: ticket.prioridad as Ticket['prioridad'],
    descripcion: ticket.descripcion,
    fotos: ticket.foto ? [ticket.foto] : [],
    direccion: ticket.ubicacion ?? '',
    sector: '',
    referencia: '',
    coordenadas: '',
    copiaA: [],
    estado: ticket.estado as Ticket['estado'],
    fechaCreacion: fechaDesdeApi(ticket.fecha_hora_creacion),
    diasPlazo: ticket.plazo_subsanar ?? 0,
    fechaVencimiento: fechaDesdeApi(ticket.fecha_vencimiento),
  };
}

export async function cargarTickets(): Promise<void> {
  // Publica la lista recibida para que el resumen se actualice automáticamente.
  const datos = await ticketsApi.listar();
  tickets = datos.map(normalizarTicket);
  emitir();
}

function subscribe(listener: () => void) {
  // Permite que React se desuscriba cuando el componente deja de estar montado.
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hook para leer los tickets desde cualquier pantalla (por ejemplo, el
// resumen) y re-renderizar automáticamente cuando se cree uno nuevo.
export function useTickets(): Ticket[] {
  return useSyncExternalStore(subscribe, getTickets);
}
