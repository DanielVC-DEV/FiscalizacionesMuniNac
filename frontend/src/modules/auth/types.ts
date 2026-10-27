// Modelo de la sesión en la app. "rol" viene de la tabla rol (admin, director,
// supervisor_empresa); null si la cuenta todavía no tiene rol asignado.
export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  id_empresa: number | null;
  rol: string | null;
}
