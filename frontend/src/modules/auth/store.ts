import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { setTokenSesion } from '../../core/api/client';
import { authApi, type AuthApi } from './api';
import type { Usuario } from './types';

// Sesión en memoria: al cerrar la app se pierde y se vuelve a pedir el login.
// Es intencional: el token no se guarda en el teléfono.
//
// En la web (empresas) se guarda en sessionStorage: sobrevive a recargar la
// página, pero se borra al cerrar la pestaña.
interface Sesion {
  usuario: Usuario;
}

const CLAVE_SESION_WEB = 'muni.sesion';

function leerSesionWeb(): (Sesion & { token: string }) | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    const guardada = window.sessionStorage.getItem(CLAVE_SESION_WEB);
    return guardada ? JSON.parse(guardada) : null;
  } catch {
    return null;
  }
}

function guardarSesionWeb(valor: (Sesion & { token: string }) | null) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    if (valor) window.sessionStorage.setItem(CLAVE_SESION_WEB, JSON.stringify(valor));
    else window.sessionStorage.removeItem(CLAVE_SESION_WEB);
  } catch {
    // Sin almacenamiento disponible (modo privado, etc.): la sesión dura sólo mientras la página esté abierta.
  }
}

// Restaura la sesión de la web al cargar la página, si la hay.
const sesionGuardada = leerSesionWeb();
if (sesionGuardada) setTokenSesion(sesionGuardada.token);
let sesionActual: Sesion | null = sesionGuardada ? { usuario: sesionGuardada.usuario } : null;
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
  guardarSesionWeb({ usuario: respuesta.usuario, token: respuesta.token });
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
  guardarSesionWeb(null);
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

// Usuarios municipales (admin o director): crean tickets y consultan contratos.
// El supervisor de empresa (rol supervisor_empresa) sólo ve y responde sus tickets.
export function esMunicipal(usuario: Usuario | null | undefined) {
  return usuario?.rol === 'admin' || usuario?.rol === 'director';
}
