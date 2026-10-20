import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIOS } from '../theme/colors';

interface Props {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

// Barra de título por pantalla: mismo patrón en toda la app (flecha de
// volver + título), para que la navegación sea predecible y fácil de
// entender para cualquier funcionario municipal, sin importar en qué
// pantalla esté.
export default function TopBar({ title, onBack, right }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.volver} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.volverTexto}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.volverHueco} />
      )}
      <Text style={styles.titulo} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.derecha}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.azul,
    minHeight: 52,
    paddingHorizontal: 10,
  },
  volver: {
    width: 34,
    height: 34,
    borderRadius: RADIOS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  volverHueco: { width: 34, height: 34 },
  volverTexto: { color: COLORS.textoClaro, fontSize: 24, fontWeight: '700', marginTop: -2 },
  titulo: { flex: 1, color: COLORS.textoClaro, fontSize: 15.5, fontWeight: '700' },
  derecha: { minWidth: 34, alignItems: 'flex-end' },
});
