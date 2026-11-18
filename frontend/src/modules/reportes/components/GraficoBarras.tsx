import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../core/theme/colors';

export interface FilaBarra {
  etiqueta: string;
  valor: number;
  color?: string;
  detalle?: string;
}

// Barras horizontales proporcionales al valor más alto. Sirve igual en web y celular.
export default function GraficoBarras({ filas }: { filas: FilaBarra[] }) {
  const maximo = Math.max(...filas.map((fila) => fila.valor), 1);
  if (filas.length === 0) return <Text style={styles.vacio}>Sin datos en el periodo.</Text>;
  return (
    <View style={styles.contenedor}>
      {filas.map((fila) => (
        <View key={fila.etiqueta} style={styles.fila}>
          <View style={styles.encabezado}>
            <Text style={styles.etiqueta} numberOfLines={1}>{fila.etiqueta}</Text>
            <Text style={styles.valor}>{fila.valor}</Text>
          </View>
          <View style={styles.pista}>
            <View
              style={[
                styles.barra,
                { width: `${(fila.valor / maximo) * 100}%`, backgroundColor: fila.color ?? COLORS.azul },
              ]}
            />
          </View>
          {!!fila.detalle && <Text style={styles.detalle}>{fila.detalle}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 10 },
  fila: { gap: 3 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  etiqueta: { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.textoPrimario },
  valor: { fontSize: 12, fontWeight: '800', color: COLORS.textoPrimario },
  pista: { height: 10, borderRadius: 5, backgroundColor: COLORS.bordeSuave, overflow: 'hidden' },
  barra: { height: 10, borderRadius: 5 },
  detalle: { fontSize: 10, color: COLORS.textoSecundario },
  vacio: { fontSize: 12, color: COLORS.textoSecundario, fontStyle: 'italic' },
});
