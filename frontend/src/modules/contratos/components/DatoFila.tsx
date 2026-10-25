import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../core/theme/colors';

interface Props {
  label: string;
  valor: string;
}

// Fila de "etiqueta: valor" para la pantalla de detalle de un contrato.
export default function DatoFila({ label, valor }: Props) {
  return (
    <View style={styles.datoFila}>
      <Text style={styles.datoLabel}>{label}</Text>
      <Text style={styles.datoValor} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  datoFila: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  datoLabel: { fontSize: 12, color: COLORS.textoSecundario, flexShrink: 0 },
  datoValor: { fontSize: 12, color: COLORS.textoPrimario, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
});
