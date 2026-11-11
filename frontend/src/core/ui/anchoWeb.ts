import { Platform, ViewStyle } from 'react-native';

// Ancho máximo del contenido de formularios y listados en la web. Se aplica
// centrado, así queda margen a ambos lados y los campos no se estiran.
export const ANCHO_CONTENIDO_WEB = 1280;

// Estilo para el contenedor de un formulario o listado. En el celular no
// cambia nada.
export const CONTENIDO_WEB: ViewStyle =
  Platform.OS === 'web' ? { width: '100%', maxWidth: ANCHO_CONTENIDO_WEB, alignSelf: 'center' } : {};
