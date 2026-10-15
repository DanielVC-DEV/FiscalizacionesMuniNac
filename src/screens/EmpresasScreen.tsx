import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import { COLORS } from '../theme/colors';
import { EMPRESAS_EJEMPLO } from '../data/datosTemporales';

// EMPRESAS_EJEMPLO es data de ejemplo temporal (ver src/data/datosTemporales.ts):
// todavía no existe una administración real de empresas. Por ahora esta
// pantalla solo las muestra; cuando se construya esa administración de
// verdad, esto se reemplaza por el registro real.

export default function EmpresasScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Empresas" onBack={() => navigation.goBack()} />

      <View style={styles.contenido}>
        <Text style={styles.nota}>Datos de ejemplo temporales, mientras no existe la Administración real.</Text>

        <View style={styles.lista}>
          {EMPRESAS_EJEMPLO.map((e) => (
            <Card key={e.rut} style={styles.card}>
              <Text style={styles.cardNombre}>{e.nombre}</Text>
              <Text style={styles.cardRut}>RUT {e.rut}</Text>
            </Card>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, flex: 1 },
  nota: { color: COLORS.textoSecundario, fontSize: 11, fontStyle: 'italic', marginBottom: 16 },
  lista: { gap: 10 },
  card: { marginBottom: 10 },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 4 },
  cardRut: { fontSize: 12, color: COLORS.textoSecundario },
});
