import { useSyncExternalStore } from 'react';
import { Contrato, Ticket } from '../types';
import { api, ContratoApi, TicketApi } from './api';

// El store conserva la última respuesta de la API y notifica a las pantallas
// cuando se reemplaza después de una carga.

let contratos: Contrato[] = [];
const listenersContratos = new Set<() => void>();

function emitirContratos() {
  // Avisa a los hooks suscritos que el contenido del store cambió.
  listenersContratos.forEach((listener) => listener());
}

export function getContratos(): Contrato[] {
  return contratos;
}

export function addContrato(contrato: Contrato) {
  // Inserta solo en el cache en memoria; la persistencia debe hacerse por api.crearContrato.
  contratos = [...contratos, contrato];
  emitirContratos();
}

function fechaDesdeApi(fecha: string): string {
  // La API entrega fechas ISO; la interfaz muestra día/mes/año.
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : fecha;
}

function normalizarContrato(contrato: ContratoApi): Contrato {
  // Adapta nombres snake_case y valores numéricos del backend al modelo de la app.
  return {
    id: String(contrato.id_contratos),
    idEmpresa: String(contrato.id_empresa),
    nombre: contrato.nombre,
    rutEmpresa: contrato.empresa_rut,
    nombreEmpresa: contrato.empresa_nombre,
    fechaInicio: fechaDesdeApi(contrato.fecha_inicio),
    fechaTermino: fechaDesdeApi(contrato.fecha_termino),
    diasRespuestaTicket: contrato.dia_respuesta ?? 0,
    ordenesCompra: (contrato.ordenes_compra ?? []).map((orden) => ({
      id: String(orden.id_compra),
      codigo: '',
      monto: String(orden.monto),
      fecha: fechaDesdeApi(orden.fecha_compra),
    })),
  };
}

export async function cargarContratos(): Promise<void> {
  // Sustituye la lista local por la respuesta vigente del servidor.
  const datos = await api.listarContratos();
  contratos = datos.map(normalizarContrato);
  emitirContratos();
}

function subscribeContratos(listener: () => void) {
  // Registra el componente y entrega la función que lo desuscribe al desmontarse.
  listenersContratos.add(listener);
  return () => listenersContratos.delete(listener);
}

// Hook para leer los contratos desde cualquier pantalla y re-renderizar
// automáticamente cuando se agregue uno nuevo.
export function useContratos(): Contrato[] {
  return useSyncExternalStore(subscribeContratos, getContratos);
}

// Texto que se muestra para elegir un contrato (por ejemplo, al crear un
// ticket): nombre del contrato + nombre de la empresa, para diferenciarlos.
export function contratoLabel(contrato: Contrato): string {
  return `${contrato.nombre} — ${contrato.nombreEmpresa}`;
}

let tickets: Ticket[] = [];
const listenersTickets = new Set<() => void>();

function emitirTickets() {
  // Actualiza las pantallas que están observando la lista de tickets.
  listenersTickets.forEach((listener) => listener());
}

export function getTickets(): Ticket[] {
  return tickets;
}

export function addTicket(ticket: Ticket) {
  // Inserta solo en el cache en memoria; la persistencia debe hacerse por api.crearTicket.
  tickets = [...tickets, ticket];
  emitirTickets();
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
  const datos = await api.listarTickets();
  tickets = datos.map(normalizarTicket);
  emitirTickets();
}

function subscribeTickets(listener: () => void) {
  // Permite que React se desuscriba cuando el componente deja de estar montado.
  listenersTickets.add(listener);
  return () => listenersTickets.delete(listener);
}

// Hook para leer los tickets desde cualquier pantalla (por ejemplo, el
// resumen) y re-renderizar automáticamente cuando se cree uno nuevo.
export function useTickets(): Ticket[] {
  return useSyncExternalStore(subscribeTickets, getTickets);
}
