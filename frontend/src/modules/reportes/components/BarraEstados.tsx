import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../core/theme/colors';

export interface TramoEstado {
  etiqueta: string;
  valor: number;
  color: string;
}

// Una sola barra dividida por estado, con leyenda y porcentaje de cada tramo.
export default function BarraEstados({ tramos, total }: { tramos: TramoEstado[]; total: number }) {
  if (total === 0) return <Text style={styles.vacio}>Sin tickets en el periodo.</Text>;
  return (
    <View style={styles.contenedor}>
      <View style={styles.barra}>
        {tramos.filter((t) => t.valor > 0).map((t) => (
          <View key={t.etiqueta} style={{ flex: t.valor, backgroundColor: t.color }} />
        ))}
      </View>
      <View style={styles.leyenda}>
        {tramos.map((t) => (
          <View key={t.etiqueta} style={styles.item}>
            <View style={[styles.punto, { backgroundColor: t.color }]} />
            <Text style={styles.texto}>
              {t.etiqueta}: <Text style={styles.negrita}>{t.valor}</Text> ({Math.round((t.valor / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 10 },
  barra: { flexDirection: 'row', height: 22, borderRadius: 11, overflow: 'hidden', backgroundColor: COLORS.bordeSuave },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5 },
  texto: { fontSize: 11, color: COLORS.textoSecundario },
  negrita: { fontWeight: '800', color: COLORS.textoPrimario },
  vacio: { fontSize: 12, color: COLORS.textoSecundario, fontStyle: 'italic' },
});
