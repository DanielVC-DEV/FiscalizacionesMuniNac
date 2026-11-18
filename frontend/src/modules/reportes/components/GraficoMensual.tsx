import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../core/theme/colors';
import { MesApi } from '../api';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const ALTO = 120;

function nombreMes(mes: string): string {
  const [anio, numero] = mes.split('-');
  return `${MESES[Number(numero) - 1] ?? numero} ${anio.slice(2)}`;
}

// Columnas por mes: tickets creados (azul) y los que ya tienen cierre (verde).
export default function GraficoMensual({ meses }: { meses: MesApi[] }) {
  if (meses.length === 0) return <Text style={styles.vacio}>Sin datos en el periodo.</Text>;
  const maximo = Math.max(...meses.map((m) => m.creados), 1);
  return (
    <View style={styles.contenedor}>
      <View style={styles.columnas}>
        {meses.map((m) => (
          <View key={m.mes} style={styles.mes}>
            <View style={[styles.area, { height: ALTO }]}>
              {[
                { valor: m.creados, color: COLORS.azul },
                { valor: m.cerrados, color: COLORS.verde },
              ].map((c) => (
                <View key={c.color} style={styles.columna}>
                  <Text style={styles.valor}>{c.valor}</Text>
                  <View
                    style={[
                      styles.barra,
                      { height: Math.max((c.valor / maximo) * (ALTO - 16), c.valor ? 3 : 0), backgroundColor: c.color },
                    ]}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.etiqueta}>{nombreMes(m.mes)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.leyenda}>
        <View style={styles.item}>
          <View style={[styles.punto, { backgroundColor: COLORS.azul }]} />
          <Text style={styles.texto}>Creados</Text>
        </View>
        <View style={styles.item}>
          <View style={[styles.punto, { backgroundColor: COLORS.verde }]} />
          <Text style={styles.texto}>Cerrados</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 10 },
  columnas: { flexDirection: 'row', gap: 6 },
  mes: { flex: 1, alignItems: 'center', gap: 4 },
  area: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  columna: { alignItems: 'center', justifyContent: 'flex-end', width: 18 },
  barra: { width: 18, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  valor: { fontSize: 10, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 2 },
  etiqueta: { fontSize: 10, color: COLORS.textoSecundario },
  leyenda: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5 },
  texto: { fontSize: 11, color: COLORS.textoSecundario },
  vacio: { fontSize: 12, color: COLORS.textoSecundario, fontStyle: 'italic' },
});
