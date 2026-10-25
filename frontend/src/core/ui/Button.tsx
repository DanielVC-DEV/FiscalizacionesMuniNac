import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, RADIOS } from '../theme/colors';

type Variante = 'primario' | 'secundario' | 'suave' | 'punteado';

interface Props {
  label: string;
  onPress?: () => void;
  variante?: Variante;
  disabled?: boolean;
  cargando?: boolean;
  style?: ViewStyle;
  icono?: ReactNode;
}

// Botones consistentes en toda la app: un único componente para que "lo
// importante" (crear, guardar) siempre se vea igual (azul, relleno) y lo
// secundario (cancelar, agregar otro ítem) se note que pesa menos.
export default function Button({ label, onPress, variante = 'primario', disabled, cargando, style, icono }: Props) {
  const estilos = ESTILOS_POR_VARIANTE[variante];
  return (
    <TouchableOpacity
      style={[styles.base, estilos.base, (disabled || cargando) && styles.deshabilitado, style]}
      onPress={onPress}
      disabled={disabled || cargando}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color={estilos.texto.color as string} size="small" />
      ) : (
        <>
          {icono}
          <Text style={[styles.texto, estilos.texto]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: RADIOS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  texto: { fontSize: 13.5, fontWeight: '700' },
  deshabilitado: { opacity: 0.5 },
});

const ESTILOS_POR_VARIANTE: Record<Variante, { base: ViewStyle; texto: { color: string } }> = {
  primario: {
    base: { backgroundColor: COLORS.azul },
    texto: { color: COLORS.textoClaro },
  },
  secundario: {
    base: { backgroundColor: COLORS.superficie, borderWidth: 1.5, borderColor: COLORS.borde },
    texto: { color: COLORS.textoPrimario },
  },
  suave: {
    base: { backgroundColor: COLORS.azulSuave },
    texto: { color: COLORS.azulOscuro },
  },
  punteado: {
    base: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.azul, borderStyle: 'dashed' },
    texto: { color: COLORS.azul },
  },
};
