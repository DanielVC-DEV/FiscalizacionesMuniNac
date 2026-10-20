import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import { COLORS } from '../theme/colors';
import { api, EmpresaApi } from '../data/api';

export default function EmpresasScreen({ navigation }: any) {
  const [empresas, setEmpresas] = useState<EmpresaApi[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    // Consulta el catálogo persistido al montar la pantalla.
    api.listarEmpresas()
      .then(setEmpresas)
      .catch((error: Error) => setErrorCarga(error.message));
  }, []);

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Empresas" onBack={() => navigation.goBack()} />

      <View style={styles.contenido}>
        {!!errorCarga && <Text style={styles.nota}>No se pudo cargar el servidor: {errorCarga}</Text>}

        <View style={styles.lista}>
          {empresas.map((empresa) => (
            <Card key={empresa.id_empresa} style={styles.card}>
              <Text style={styles.cardNombre}>{empresa.razon_social}</Text>
              <Text style={styles.cardRut}>RUT {empresa.rut}</Text>
            </Card>
          ))}
        </View>
        {!errorCarga && empresas.length === 0 && <Text style={styles.nota}>No hay empresas registradas.</Text>}
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
