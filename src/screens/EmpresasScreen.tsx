import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { EMPRESAS_EJEMPLO } from '../data/datosTemporales';

// EMPRESAS_EJEMPLO es data de ejemplo temporal (ver src/data/datosTemporales.ts):
// todavía no existe una administración real de empresas. Por ahora esta
// pantalla solo las muestra; cuando se construya esa administración de
// verdad, esto se reemplaza por el registro real.

export default function EmpresasScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <View style={styles.linea} />

      <View style={styles.contenido}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.barraTitulo}>
          <Text style={styles.barraTitulotexto}>Empresas</Text>
        </View>

        <Text style={styles.nota}>Datos de ejemplo temporales, mientras no existe la Administración real.</Text>

        <View style={styles.lista}>
          {EMPRESAS_EJEMPLO.map((e) => (
            <View key={e.rut} style={styles.card}>
              <Text style={styles.cardNombre}>{e.nombre}</Text>
              <Text style={styles.cardRut}>RUT {e.rut}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#d9d9d9' },
  linea: { height: 1, backgroundColor: '#111', marginHorizontal: 4 },
  contenido: { padding: 16, flex: 1 },
  back: { fontSize: 13, color: '#1c2126', marginBottom: 10 },
  barraTitulo: {
    backgroundColor: '#686462',
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  barraTitulotexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  nota: { color: '#5b6570', fontSize: 11, fontStyle: 'italic', marginBottom: 16 },
  lista: { gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e6ea',
    padding: 14,
    marginBottom: 10,
  },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: '#1c2126', marginBottom: 4 },
  cardRut: { fontSize: 12, color: '#5b6570' },
});
