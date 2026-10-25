import { useSyncExternalStore } from 'react';
import { fechaDesdeApi } from '../../core/utils/fechas';
import { Contrato } from './types';
import { contratosApi, ContratoApi } from './api';

// Store en memoria de contratos: conserva la última respuesta de la API y
// notifica a las pantallas cuando se reemplaza después de una carga.

let contratos: Contrato[] = [];
const listeners = new Set<() => void>();

function emitir() {
  // Avisa a los hooks suscritos que el contenido del store cambió.
  listeners.forEach((listener) => listener());
}

export function getContratos(): Contrato[] {
  return contratos;
}

export function addContrato(contrato: Contrato) {
  // Inserta solo en el cache en memoria; la persistencia debe hacerse por contratosApi.crear.
  contratos = [...contratos, contrato];
  emitir();
}

function normalizarContrato(contrato: ContratoApi): Contrato {
  // Adapta nombres snake_case y valores numéricos del backend al modelo de la app.
  return {
    id: String(contrato.id_contratos),
    idEmpresa: String(contrato.id_empresa),
    idSupervisor: contrato.id_supervisor,
    supervisorNombre: contrato.supervisor_nombre,
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
  const datos = await contratosApi.listar();
  contratos = datos.map(normalizarContrato);
  emitir();
}

function subscribe(listener: () => void) {
  // Registra el componente y entrega la función que lo desuscribe al desmontarse.
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hook para leer los contratos desde cualquier pantalla y re-renderizar
// automáticamente cuando se agregue uno nuevo.
export function useContratos(): Contrato[] {
  return useSyncExternalStore(subscribe, getContratos);
}

// Texto que se muestra para elegir un contrato (por ejemplo, al crear un
// ticket): nombre del contrato + nombre de la empresa, para diferenciarlos.
export function contratoLabel(contrato: Contrato): string {
  return `${contrato.nombre} — ${contrato.nombreEmpresa}`;
}
