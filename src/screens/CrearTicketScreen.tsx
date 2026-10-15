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
import TopBar from '../components/TopBar';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import { COLORS, RADIOS } from '../theme/colors';
import { PRIORIDADES, DIAS_PLAZO_POR_PRIORIDAD, Prioridad } from '../types';
import { sumarDiasHabiles, formatearFecha } from '../utils/businessDays';
import { useContratos, contratoLabel, addTicket } from '../data/store';
import { AREAS_EJEMPLO, SUPERVISORES_EJEMPLO } from '../data/datosTemporales';

// AREAS_EJEMPLO y SUPERVISORES_EJEMPLO son data de ejemplo temporal (ver
// src/data/datosTemporales.ts): todavía no existe la pantalla de
// Administración donde se gestionen de verdad.
const AREAS: string[] = AREAS_EJEMPLO;
const SUPERVISORES: string[] = SUPERVISORES_EJEMPLO;
const DESTINATARIOS_NOTIFICACION: string[] = [];

interface Foto {
  id: string;
  uri: string;
}

export default function CrearTicketScreen({ navigation }: any) {
  // Contratos reales, creados en "Nuevo contrato" (almacén en memoria,
  // src/data/store.ts). A diferencia de Área y Supervisor, esto ya no es
  // data de ejemplo.
  const contratos = useContratos();
  const opcionesContrato = contratos.map(contratoLabel);

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
    // Todavía no hay backend: esto se guarda en el almacén en memoria
    // (src/data/store.ts), igual que los contratos. Dura mientras la app
    // esté abierta; cuando exista el backend, esto se reemplaza por un
    // guardado real.
    addTicket({
      id: `${Date.now()}`,
      contrato: contrato!,
      area: area!,
      supervisor: supervisor!,
      prioridad: prioridad!,
      descripcion: descripcion.trim(),
      fotos: fotos.map((f) => f.uri),
      direccion: direccion.trim(),
      sector: sector.trim(),
      referencia: referencia.trim(),
      coordenadas: coordenadas.trim(),
      copiaA,
      estado: 'ABIERTO',
      fechaCreacion: formatearFecha(new Date()),
      diasPlazo: plazoInfo!.dias,
      fechaVencimiento: formatearFecha(plazoInfo!.vencimiento),
    });
    Alert.alert('Ticket creado', 'Ya puedes verlo en el resumen de tickets.');
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Nuevo ticket" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.seccion}>DATOS</Text>

        <SelectField
          label="Contrato"
          requerido
          placeholder="Seleccionar contrato"
          value={contrato}
          options={opcionesContrato}
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
          placeholderTextColor={COLORS.textoTenue}
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />
        {!!errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

        <Text style={[styles.label, { marginTop: 10 }]}>Fotografías</Text>
        <View style={styles.fila}>
          <Button label="Tomar foto" variante="suave" onPress={tomarFoto} style={{ flex: 1 }} />
          <Button label="Elegir desde el dispositivo" variante="suave" onPress={elegirImagen} style={{ flex: 1 }} />
        </View>
        {fotos.length > 0 && (
          <View style={styles.miniaturas}>
            {fotos.map((f) => (
              <View key={f.id} style={styles.miniaturaBox}>
                <Image source={{ uri: f.uri }} style={styles.miniatura} />
                <TouchableOpacity style={styles.miniaturaQuitar} onPress={() => quitarFoto(f.id)}>
                  <Text style={styles.miniaturaQuitarTexto}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.seccion}>UBICACIÓN (GEOLOCALIZACIÓN)</Text>
        <Button
          label={buscandoUbicacion ? 'Buscando ubicación…' : 'Ubicación actual'}
          variante="primario"
          onPress={usarUbicacionActual}
          disabled={buscandoUbicacion}
          cargando={buscandoUbicacion}
          style={styles.botonUbicacion}
        />
        {!!ubicacionError && <Text style={styles.error}>{ubicacionError}</Text>}

        <Text style={styles.seccion}>UBICACIÓN MANUAL</Text>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Seleccionar dirección"
          placeholderTextColor={COLORS.textoTenue}
          value={direccion}
          onChangeText={setDireccion}
        />
        <Text style={styles.label}>Sector o lugar</Text>
        <TextInput
          style={styles.input}
          placeholder="sector, plaza, recinto…"
          placeholderTextColor={COLORS.textoTenue}
          value={sector}
          onChangeText={setSector}
        />
        <Text style={styles.label}>Referencia de ubicación</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: frente de un negocio"
          placeholderTextColor={COLORS.textoTenue}
          value={referencia}
          onChangeText={setReferencia}
        />
        <Text style={styles.label}>Coordenadas</Text>
        <TextInput
          style={styles.input}
          placeholder="Se completa con la ubicación"
          placeholderTextColor={COLORS.textoTenue}
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
        <Button label="Cancelar" variante="secundario" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <Button label="Crear" variante="primario" onPress={crear} style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 24 },
  seccion: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.azulOscuro,
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  label: { fontSize: 12, color: COLORS.textoPrimario, marginBottom: 4, marginTop: 6, fontWeight: '600' },
  req: { color: COLORS.rojo },
  input: {
    height: 46,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    marginBottom: 8,
  },
  textarea: {
    minHeight: 90,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    padding: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    textAlignVertical: 'top',
  },
  error: { color: COLORS.rojo, fontSize: 11, marginTop: 4 },
  avisoVacio: { color: COLORS.textoSecundario, fontSize: 11.5, marginBottom: 6 },
  auto: {
    backgroundColor: COLORS.azulSuave,
    borderRadius: RADIOS.md,
    padding: 10,
    marginBottom: 8,
  },
  autoTexto: { fontSize: 11, color: COLORS.azulOscuro, lineHeight: 16, textAlign: 'center' },
  fila: { flexDirection: 'row', gap: 8, marginTop: 4 },
  botonUbicacion: { marginTop: 6, marginBottom: 4 },
  miniaturas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  miniaturaBox: { width: 64, height: 64 },
  miniatura: { width: 64, height: 64, borderRadius: RADIOS.sm, backgroundColor: COLORS.borde },
  miniaturaQuitar: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.rojo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniaturaQuitarTexto: { color: COLORS.textoClaro, fontSize: 11, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8 },
  chip: {
    borderRadius: RADIOS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipActivo: { backgroundColor: COLORS.azul, borderColor: COLORS.azul },
  chipTexto: { fontSize: 11.5, color: COLORS.textoPrimario },
  chipTextoActivo: { color: COLORS.textoClaro, fontWeight: '600' },
  barraInferior: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.bordeSuave,
    backgroundColor: COLORS.superficie,
  },
});
