import { StyleSheet, Text, View } from 'react-native';
import { RADIOS } from '../../../core/theme/colors';

interface Props {
  etiqueta: string;
  numero: number;
  color: string;
  suave: string;
  oscuro: string;
}

// Tarjeta de indicador (número grande + etiqueta) para la fila "Requiere atención".
export default function Stat({ etiqueta, numero, color, suave, oscuro }: Props) {
  return (
    <View style={[styles.stat, { backgroundColor: suave, borderColor: color }]}>
      <Text style={[styles.statTexto, { color: oscuro }]}>{etiqueta}</Text>
      <Text style={[styles.statNumero, { color }]}>{numero}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  statTexto: { fontSize: 10.5, textAlign: 'center', fontWeight: '600' },
  statNumero: { fontSize: 22, fontWeight: '800' },
});
