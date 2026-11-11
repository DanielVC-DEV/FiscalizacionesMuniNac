import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/colors';

// En la web la app ocupa toda la ventana, como una página; las pantallas
// reordenan sus piezas en columnas según el ancho. En el celular no hace
// nada y devuelve los hijos tal cual.
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
  panel: { flex: 1, width: '100%', backgroundColor: COLORS.fondo },
});
