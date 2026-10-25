import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, RADIOS } from '../theme/colors';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Contenedor blanco con borde suave, reutilizado por tarjetas de
// contratos, tickets, empresas, etc. Reemplaza los bordes/paddings
// repetidos a mano en cada pantalla.
export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.superficie,
    borderRadius: RADIOS.md,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    padding: 14,
  },
});
