import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { avisar } from '../../core/ui/avisos';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import TarjetaSeccion, { FilaCampos } from '../../core/ui/TarjetaSeccion';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { areasApi, AreaApi } from './api';
import { CONTENIDO_WEB } from '../../core/ui/anchoWeb';

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
      avisar('Área creada', 'El área quedó guardada en el servidor.');
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
      <ScrollView contentContainerStyle={[styles.contenido, CONTENIDO_WEB]} keyboardShouldPersistTaps="handled">
        <TarjetaSeccion titulo="Agregar área" descripcion="Las áreas agrupan las empresas contratistas.">
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del área"
            placeholderTextColor={COLORS.textoTenue}
          />
          <Button label="Guardar área" onPress={crearArea} cargando={guardando} style={styles.botonGuardar} />
        </TarjetaSeccion>

        {!!error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.tituloLista}>Áreas registradas</Text>
        <View style={styles.lista}>
          {areas.map((area) => (
            <Card key={area.id_area} style={styles.tarjetaArea}>
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
  contenido: { padding: 20, paddingBottom: 24 },
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
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  botonGuardar: { alignSelf: 'flex-end', minWidth: 200 },
  tarjetaArea: { flexGrow: 1, flexBasis: 240 },
  nombreArea: { color: COLORS.textoPrimario, fontSize: 13, fontWeight: '600' },
  error: { color: COLORS.rojo, fontSize: 11, marginBottom: 10 },
  nota: { color: COLORS.textoSecundario, fontSize: 11, fontStyle: 'italic' },
});
