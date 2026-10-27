import { useSyncExternalStore } from 'react';
import { setTokenSesion } from '../../core/api/client';
import { authApi, type AuthApi } from './api';
import type { Usuario } from './types';

// Sesión en memoria: al cerrar la app se pierde y se vuelve a pedir el login.
// Es intencional: el token no se guarda en el teléfono.
interface Sesion {
  usuario: Usuario;
}

let sesionActual: Sesion | null = null;
const suscriptores = new Set<() => void>();

function notificar() {
  suscriptores.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  suscriptores.add(avisar);
  return () => {
    suscriptores.delete(avisar);
  };
}

function obtenerSesion() {
  return sesionActual;
}

// Llamado tras un login o registro exitosos. Activa el token para las demás llamadas.
export function iniciarSesion(respuesta: AuthApi) {
  setTokenSesion(respuesta.token);
  sesionActual = { usuario: respuesta.usuario };
  notificar();
}

// Avisa al servidor para invalidar el token y, pase lo que pase, limpia la sesión local.
export async function cerrarSesion() {
  try {
    await authApi.logout();
  } catch {
    // Si no hay conexión, igual se cierra la sesión en el teléfono.
  }
  setTokenSesion(null);
  sesionActual = null;
  notificar();
}

// Sesión activa (o null) para que la navegación muestre las pantallas correctas.
export function useSesion() {
  return useSyncExternalStore(suscribir, obtenerSesion);
}

// Sólo el administrador gestiona empresas, áreas, supervisores y contratos.
// El backend lo vuelve a exigir; esto sólo oculta lo que no se puede usar.
export function esAdministrador(usuario: Usuario | null | undefined) {
  return usuario?.rol === 'admin';
}
