import { useSyncExternalStore } from 'react';
import { Contrato, Ticket } from '../types';

// Todavía no existe backend. Este es un almacén EN MEMORIA, solo para esta
// sesión de la app (se pierde si cierras la app por completo): sirve para
// que un contrato o un ticket creado aparezcan de inmediato en sus
// listados, sin tener que mostrar el aviso de "cuando exista el backend".
// Cuando exista el backend, esto se reemplaza por datos reales guardados
// en el servidor.

let contratos: Contrato[] = [];
const listenersContratos = new Set<() => void>();

function emitirContratos() {
  listenersContratos.forEach((listener) => listener());
}

export function getContratos(): Contrato[] {
  return contratos;
}

export function addContrato(contrato: Contrato) {
  contratos = [...contratos, contrato];
  emitirContratos();
}

function subscribeContratos(listener: () => void) {
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
  listenersTickets.forEach((listener) => listener());
}

export function getTickets(): Ticket[] {
  return tickets;
}

export function addTicket(ticket: Ticket) {
  tickets = [...tickets, ticket];
  emitirTickets();
}

function subscribeTickets(listener: () => void) {
  listenersTickets.add(listener);
  return () => listenersTickets.delete(listener);
}

// Hook para leer los tickets desde cualquier pantalla (por ejemplo, el
// resumen) y re-renderizar automáticamente cuando se cree uno nuevo.
export function useTickets(): Ticket[] {
  return useSyncExternalStore(subscribeTickets, getTickets);
}
