import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { COLORS, SOMBRA } from '../theme/colors';

// Ancho máximo del panel de la app en navegador. Pensado para que las
// pantallas, diseñadas para celular, se lean bien en un monitor.
export const ANCHO_MAXIMO_WEB = 760;

// En la web centra toda la app en un panel de ancho acotado sobre un fondo de
// página; en el celular no hace nada y devuelve los hijos tal cual.
export default function MarcoWeb({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.pagina}>
      <View style={styles.panel}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: COLORS.borde },
  panel: {
    flex: 1,
    width: '100%',
    maxWidth: ANCHO_MAXIMO_WEB,
    alignSelf: 'center',
    backgroundColor: COLORS.fondo,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.borde,
    ...SOMBRA,
  },
});
