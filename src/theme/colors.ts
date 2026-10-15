// Paleta oficial de la Plataforma, según la sección 25 del Informe de
// Requerimientos (códigos de color para estados y elementos de la app).
// Estos 4 valores son fijos — no son una elección de diseño, son los
// colores que define el informe:
//   Azul    #01497c
//   Rojo    #7c0101
//   Verde   #017c15
//   Amarillo #8a8704
//
// A partir de esos 4 colores se arman acá variantes (oscuro para
// profundidad, suave/tint para fondos de tarjetas y badges) y algunos
// neutros, para que toda la app combine de forma consistente.

export const COLORS = {
  // Colores oficiales del informe
  azul: '#01497c',
  rojo: '#7c0101',
  verde: '#017c15',
  amarillo: '#8a8704',

  // Variantes oscuras (para texto sobre fondo suave, o profundidad)
  azulOscuro: '#01324f',
  rojoOscuro: '#5c0101',
  verdeOscuro: '#015c10',
  amarilloOscuro: '#5f5c03',

  // Variantes suaves / tint (fondos de tarjetas, badges, chips)
  azulSuave: '#e4edf3',
  rojoSuave: '#f8e6e4',
  verdeSuave: '#e3f1e4',
  amarilloSuave: '#f3f1e1',

  // Neutros
  blanco: '#ffffff',
  fondo: '#eef1f4',
  superficie: '#ffffff',
  borde: '#dde3e9',
  bordeSuave: '#eceef1',

  textoPrimario: '#1c2126',
  textoSecundario: '#5b6570',
  textoTenue: '#8b93a0',
  textoClaro: '#ffffff',
};

// Colores por estado de ticket (sección 13 del informe) + "vencido"
// (condición derivada, no un estado guardado). Se definen acá para que el
// mismo criterio de color se use en Resumen, Tickets y Contratos.
export const COLOR_ESTADO: Record<string, { color: string; suave: string; oscuro: string; etiqueta: string }> = {
  ABIERTO: { color: COLORS.azul, suave: COLORS.azulSuave, oscuro: COLORS.azulOscuro, etiqueta: 'Abierto' },
  RESPONDIDO: { color: COLORS.amarillo, suave: COLORS.amarilloSuave, oscuro: COLORS.amarilloOscuro, etiqueta: 'Respondido' },
  REQUIERE_NUEVA_SUBSANACION: {
    color: COLORS.rojo,
    suave: COLORS.rojoSuave,
    oscuro: COLORS.rojoOscuro,
    etiqueta: 'Requiere nueva subsanación',
  },
  SUBSANADO_CONFORME: { color: COLORS.verde, suave: COLORS.verdeSuave, oscuro: COLORS.verdeOscuro, etiqueta: 'Subsanado conforme' },
  CERRADO: { color: COLORS.textoSecundario, suave: '#eceef1', oscuro: COLORS.textoPrimario, etiqueta: 'Cerrado' },
  VENCIDO: { color: COLORS.rojo, suave: COLORS.rojoSuave, oscuro: COLORS.rojoOscuro, etiqueta: 'Vencido' },
};

export const RADIOS = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 };
export const ESPACIOS = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const SOMBRA = {
  shadowColor: '#0b1a26',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
};
