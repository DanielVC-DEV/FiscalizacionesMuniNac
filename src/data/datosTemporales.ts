import { Empresa } from '../types';

// ⚠️ DATOS DE EJEMPLO TEMPORALES ⚠️
// Pedidos a propósito por el usuario para poder probar el formulario de
// "Nuevo ticket" y "Nuevo contrato" mientras no existe la pantalla de
// Administración (gestión real de áreas, supervisores y empresas, sección
// 19 del informe). Simplificados a "Área 1/2/3" y "Empresa 1/2/3" a la
// espera de la reunión donde se defina cómo se va a manejar esto de
// verdad. Cuando se construya esa pantalla, estas listas se reemplazan
// por el registro real y este archivo se borra.

export const AREAS_EJEMPLO: string[] = ['Área 1', 'Área 2', 'Área 3'];

export const SUPERVISORES_EJEMPLO: string[] = ['Supervisor 1', 'Supervisor 2', 'Supervisor 3'];

export const EMPRESAS_EJEMPLO: Empresa[] = [
  { rut: '11.111.111-1', nombre: 'Empresa 1' },
  { rut: '22.222.222-2', nombre: 'Empresa 2' },
  { rut: '33.333.333-3', nombre: 'Empresa 3' },
];
