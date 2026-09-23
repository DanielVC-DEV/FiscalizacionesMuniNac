import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SelectField from '../components/SelectField';
import { PRIORIDADES, DIAS_PLAZO_POR_PRIORIDAD, Prioridad } from '../types';
import { sumarDiasHabiles, formatearFecha } from '../utils/businessDays';

// Todavía no existen contratos, áreas ni supervisores reales (eso se arma
// en otra pantalla más adelante), así que estas listas parten vacías a
// propósito. Cuando construyamos Contratos/Administración, esto se va a
// reemplazar por datos reales.
const CONTRATOS: string[] = [];
const AREAS: string[] = [];
const SUPERVISORES: string[] = [];
const DESTINATARIOS_NOTIFICACION: string[] = [];

interface Foto {
  id: string;
  uri: string;
}

export default function CrearTicketScreen({ navigation }: any) {
  const [contrato, setContrato] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [supervisor, setSupervisor] = useState<string | null>(null);
  const [prioridad, setPrioridad] = useState<Prioridad | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [direccion, setDireccion] = useState('');
  const [sector, setSector] = useState('');
  const [referencia, setReferencia] = useState('');
  const [coordenadas, setCoordenadas] = useState('');
  const [copiaA, setCopiaA] = useState<string[]>([]);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [ubicacionError, setUbicacionError] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const plazoInfo = prioridad
    ? (() => {
        const dias = DIAS_PLAZO_POR_PRIORIDAD[prioridad];
        const vencimiento = sumarDiasHabiles(new Date(), dias);
        return { dias, vencimiento };
      })()
    : null;

  async function tomarFoto() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la cámara para tomar la foto.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!resultado.canceled) {
      setFotos((prev) => [...prev, { id: `${Date.now()}`, uri: resultado.assets[0].uri }]);
    }
  }

  async function elegirImagen() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para elegir la imagen.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!resultado.canceled) {
      setFotos((prev) => [...prev, { id: `${Date.now()}`, uri: resultado.assets[0].uri }]);
    }
  }

  function quitarFoto(id: string) {
    setFotos((prev) => prev.filter((f) => f.id !== id));
  }

  // Sección 7 del informe: si la ubicación automática falla, no debe
  // bloquear la creación del ticket, y siempre debe quedar la alternativa
  // de ingreso manual.
  async function usarUbicacionActual() {
    setUbicacionError(null);
    setBuscandoUbicacion(true);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        setUbicacionError('No se autorizó el acceso a la ubicación. Completa los datos a mano.');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = posicion.coords;
      setCoordenadas(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } catch {
      setUbicacionError('No se pudo obtener la ubicación. Completa los datos a mano.');
    } finally {
      setBuscandoUbicacion(false);
    }
  }

  function alternarCopiaA(destinatario: string) {
    setCopiaA((prev) =>
      prev.includes(destinatario) ? prev.filter((d) => d !== destinatario) : [...prev, destinatario],
    );
  }

  function validar(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!contrato) nuevosErrores.contrato = 'Selecciona el contrato asociado.';
    if (!area) nuevosErrores.area = 'Selecciona el área responsable.';
    if (!supervisor) nuevosErrores.supervisor = 'Selecciona el supervisor asignado.';
    if (!prioridad) nuevosErrores.prioridad = 'Selecciona una prioridad.';
    if (!descripcion.trim()) nuevosErrores.descripcion = 'Describe la observación.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function crear() {
    if (!validar()) return;
    // Por ahora no hay dónde guardar el ticket (no existe backend ni lista
    // de tickets todavía), así que solo confirmamos que el formulario es
    // válido. Esto se conecta de verdad cuando armemos esa parte.
    Alert.alert('Formulario válido', 'Cuando exista el backend, aquí se va a crear el ticket.');
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <View style={styles.linea} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.tituloFila}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Nuevo ticket</Text>
        </View>

        <Text style={styles.seccion}>DATOS</Text>

        <SelectField
          label="Contrato"
          requerido
          placeholder="Seleccionar contrato"
          value={contrato}
          options={CONTRATOS}
          onChange={setContrato}
          mensajeVacio="Aún no hay contratos cargados."
          error={errores.contrato}
        />

        <SelectField
          label="Área responsable"
          requerido
          placeholder="Seleccionar área"
          value={area}
          options={AREAS}
          onChange={setArea}
          mensajeVacio="Aún no hay áreas cargadas."
          error={errores.area}
        />

        <SelectField
          label="Supervisor asignado"
          requerido
          placeholder="Seleccionar supervisor"
          value={supervisor}
          options={SUPERVISORES}
          onChange={setSupervisor}
          mensajeVacio="Aún no hay supervisores cargados."
          error={errores.supervisor}
        />

        <SelectField
          label="Prioridad"
          requerido
          placeholder="Seleccionar prioridad"
          value={prioridad}
          options={PRIORIDADES}
          onChange={(v) => setPrioridad(v as Prioridad)}
          error={errores.prioridad}
        />
        {plazoInfo && (
          <View style={styles.auto}>
            <Text style={styles.autoTexto}>Plazo: {plazoInfo.dias} día(s) hábil(es)</Text>
            <Text style={styles.autoTexto}>Vence: {formatearFecha(plazoInfo.vencimiento)}</Text>
          </View>
        )}

        <Text style={styles.seccion}>OBSERVACIÓN</Text>

        <Text style={styles.label}>
          Descripción de la observación<Text style={styles.req}> *</Text>
        </Text>
        <TextInput
          style={styles.textarea}
          placeholder="Describe lo observado…"
          placeholderTextColor="#8b93a0"
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />
        {!!errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

        <Text style={[styles.label, { marginTop: 10 }]}>Fotografías</Text>
        <View style={styles.fila}>
          <TouchableOpacity style={styles.botonOscuro} onPress={tomarFoto}>
            <Text style={styles.botonOscuroTexto}>Tomar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonOscuro} onPress={elegirImagen}>
            <Text style={styles.botonOscuroTexto}>Elegir desde el dispositivo</Text>
          </TouchableOpacity>
        </View>
        {fotos.length > 0 && (
          <View style={styles.miniaturas}>
            {fotos.map((f) => (
              <View key={f.id} style={styles.miniaturaBox}>
                <Image source={{ uri: f.uri }} style={styles.miniatura} />
                <TouchableOpacity style={styles.miniaturaQuitar} onPress={() => quitarFoto(f.id)}>
                  <Text style={styles.miniaturaQuitarTexto}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.seccion}>UBICACIÓN (GEOLOCALIZACIÓN)</Text>
        <TouchableOpacity
          style={styles.botonOscuroFull}
          onPress={usarUbicacionActual}
          disabled={buscandoUbicacion}
        >
          <Text style={styles.botonOscuroTexto}>
            {buscandoUbicacion ? 'Buscando ubicación…' : 'Ubicación actual'}
          </Text>
        </TouchableOpacity>
        {!!ubicacionError && <Text style={styles.error}>{ubicacionError}</Text>}

        <Text style={styles.seccion}>UBICACIÓN MANUAL</Text>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Seleccionar dirección"
          placeholderTextColor="#8b93a0"
          value={direccion}
          onChangeText={setDireccion}
        />
        <Text style={styles.label}>Sector o lugar</Text>
        <TextInput
          style={styles.input}
          placeholder="sector, plaza, recinto…"
          placeholderTextColor="#8b93a0"
          value={sector}
          onChangeText={setSector}
        />
        <Text style={styles.label}>Referencia de ubicación</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: frente de un negocio"
          placeholderTextColor="#8b93a0"
          value={referencia}
          onChangeText={setReferencia}
        />
        <Text style={styles.label}>Coordenadas</Text>
        <TextInput
          style={styles.input}
          placeholder="Se completa con la ubicación"
          placeholderTextColor="#8b93a0"
          value={coordenadas}
          onChangeText={setCoordenadas}
        />

        <Text style={styles.seccion}>NOTIFICACIÓN</Text>
        <Text style={styles.label}>Enviar copia a (opcional)</Text>
        {DESTINATARIOS_NOTIFICACION.length === 0 ? (
          <Text style={styles.avisoVacio}>Aún no hay destinatarios cargados.</Text>
        ) : (
          <View style={styles.chips}>
            {DESTINATARIOS_NOTIFICACION.map((d) => {
              const activo = copiaA.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, activo && styles.chipActivo]}
                  onPress={() => alternarCopiaA(d)}
                >
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.auto}>
          <Text style={styles.autoTexto}>Información del creador del ticket: fecha y hora</Text>
          <Text style={styles.autoTexto}>La ID se genera automáticamente</Text>
        </View>
      </ScrollView>

      <View style={styles.barraInferior}>
        <TouchableOpacity style={styles.botonClaro} onPress={() => navigation.goBack()}>
          <Text style={styles.botonClaroTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botonOscuroFull, { flex: 1, marginTop: 0 }]} onPress={crear}>
          <Text style={styles.botonOscuroTexto}>Crear</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#d9d9d9' },
  linea: { height: 1, backgroundColor: '#111', marginHorizontal: 4 },
  contenido: { padding: 16, paddingBottom: 24 },
  tituloFila: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  back: { fontSize: 18, color: '#1c2126' },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1c2126' },
  seccion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c2126',
    marginTop: 18,
    marginBottom: 8,
  },
  label: { fontSize: 12, color: '#1c2126', marginBottom: 4, marginTop: 6 },
  req: { color: '#7c0101' },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7dbe0',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1c2126',
    marginBottom: 8,
  },
  textarea: {
    minHeight: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7dbe0',
    backgroundColor: '#fff',
    padding: 12,
    fontSize: 13,
    color: '#1c2126',
    textAlignVertical: 'top',
  },
  error: { color: '#7c0101', fontSize: 11, marginTop: 4 },
  avisoVacio: { color: '#5b6570', fontSize: 11.5, marginBottom: 6 },
  auto: {
    backgroundColor: '#686462',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  autoTexto: { fontSize: 11, color: '#fff', lineHeight: 16, textAlign: 'center' },
  fila: { flexDirection: 'row', gap: 8, marginTop: 4 },
  botonOscuro: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#686462',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  botonOscuroFull: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#686462',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  botonOscuroTexto: { color: '#fff', fontSize: 12.5, fontWeight: '600', textAlign: 'center' },
  miniaturas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  miniaturaBox: { width: 64, height: 64 },
  miniatura: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#d7dbe0' },
  miniaturaQuitar: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7c0101',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniaturaQuitarTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8 },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d7dbe0',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipActivo: { backgroundColor: '#01497c', borderColor: '#01497c' },
  chipTexto: { fontSize: 11.5, color: '#1c2126' },
  chipTextoActivo: { color: '#fff', fontWeight: '600' },
  barraInferior: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#00000022',
    backgroundColor: '#d9d9d9',
  },
  botonClaro: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1c2126',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonClaroTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
