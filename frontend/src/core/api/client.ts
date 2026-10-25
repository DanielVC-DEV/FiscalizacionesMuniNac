// Cliente HTTP compartido por todos los módulos. Cada módulo define sus
// propios endpoints (ver modules/<modulo>/api.ts) y usa esta función.

// La URL se puede cambiar por entorno para usar localhost, un emulador o un teléfono físico.
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Todas las llamadas comparten la misma URL base y encabezados JSON.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  // Las respuestas 204 no traen JSON; en las demás, un cuerpo inválido se trata como vacío.
  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  // Propaga el mensaje del servidor para que la pantalla pueda informar el fallo.
  if (!response.ok) {
    throw new Error(payload?.error || `Error de conexión (${response.status})`);
  }

  return payload as T;
}
