import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../core/ui/Header';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { areasApi, AreaApi } from './api';

export default function AreasScreen({ navigation }: any) {
  const [areas, setAreas] = useState<AreaApi[]>([]);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarAreas = useCallback(async () => {
    try {
      setAreas(await areasApi.listar());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarAreas();
    }, [cargarAreas])
  );

  async function crearArea() {
    if (!nombre.trim()) {
      setError('Ingresa el nombre del área.');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await areasApi.crear({ nombre: nombre.trim() });
      setNombre('');
      await cargarAreas();
      Alert.alert('Área creada', 'El área quedó guardada en el servidor.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Áreas" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Card style={styles.formulario}>
          <Text style={styles.titulo}>Agregar área</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del área"
            placeholderTextColor={COLORS.textoTenue}
          />
          <Button label="Guardar área" onPress={crearArea} cargando={guardando} />
        </Card>

        {!!error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.tituloLista}>Áreas registradas</Text>
        <View style={styles.lista}>
          {areas.map((area) => (
            <Card key={area.id_area}>
              <Text style={styles.nombreArea}>{area.nombre}</Text>
            </Card>
          ))}
        </View>
        {!error && areas.length === 0 && <Text style={styles.nota}>No hay áreas registradas.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 24 },
  formulario: { marginBottom: 16 },
  titulo: { color: COLORS.textoPrimario, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  tituloLista: { color: COLORS.azulOscuro, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: {
    height: 46,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    marginBottom: 10,
  },
  lista: { gap: 10 },
  nombreArea: { color: COLORS.textoPrimario, fontSize: 13, fontWeight: '600' },
  error: { color: COLORS.rojo, fontSize: 11, marginBottom: 10 },
  nota: { color: COLORS.textoSecundario, fontSize: 11, fontStyle: 'italic' },
});
