// Tipos y reglas fijas del negocio, según el Informe de Requerimientos.
// Esto no es "data de prueba": son reglas definidas por el informe
// (sección 8), no inventos nuestros.

export type Prioridad = 'Urgente' | 'Muy alta' | 'Alta' | 'Normal' | 'Baja';

export const PRIORIDADES: Prioridad[] = ['Urgente', 'Muy alta', 'Alta', 'Normal', 'Baja'];

// Días hábiles de plazo por prioridad (tabla de la sección 8 del informe).
export const DIAS_PLAZO_POR_PRIORIDAD: Record<Prioridad, number> = {
  Urgente: 1,
  'Muy alta': 2,
  Alta: 3,
  Normal: 5,
  Baja: 10,
};
