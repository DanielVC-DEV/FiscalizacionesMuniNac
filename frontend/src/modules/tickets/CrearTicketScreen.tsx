import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { avisar } from '../../core/ui/avisos';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import SelectField from '../../core/ui/SelectField';
import Button from '../../core/ui/Button';
import TarjetaSeccion, { FilaCampos } from '../../core/ui/TarjetaSeccion';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { Prioridad } from './types';
import { sumarDiasHabiles, formatearFecha } from '../../core/utils/businessDays';
import { contratosApi, ContratoApi } from '../contratos/api';
import { ticketsApi } from './api';
import { cargarContratos, useContratos, contratoLabel } from '../contratos/store';
import { cargarTickets } from './store';
import FotosField, { Foto } from './components/FotosField';
import { CONTENIDO_WEB } from '../../core/ui/anchoWeb';

// "lat, lon" (como se muestra en pantalla) a números; vacío si no hay coordenadas válidas.
function coordenadasNumericas(texto: string): { latitud?: number; longitud?: number } {
  if (!texto.includes(',')) return {};
  const [latitud, longitud] = texto.split(',').map((valor) => Number(valor.trim()));
  return Number.isFinite(latitud) && Number.isFinite(longitud) ? { latitud, longitud } : {};
}

export default function CrearTicketScreen({ navigation }: any) {
  // Contratos y supervisores cargados desde el backend.
  const contratos = useContratos();
  const opcionesContrato = contratos.map(contratoLabel);

  const [contrato, setContrato] = useState<string | null>(null);
  const [prioridadesContrato, setPrioridadesContrato] = useState<NonNullable<ContratoApi['prioridades']>>([]);
  const [prioridad, setPrioridad] = useState<Prioridad | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [direccion, setDireccion] = useState('');
  const [sector, setSector] = useState('');
  const [referencia, setReferencia] = useState('');
  const [coordenadas, setCoordenadas] = useState('');
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [ubicacionError, setUbicacionError] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    // Carga contratos al entrar para que el selector no dependa de datos de ejemplo.
    cargarContratos().catch((error: Error) => setErrorCarga(error.message));
  }, []);

  const contratoSeleccionado = contratos.find((item) => contratoLabel(item) === contrato) ?? null;

  async function seleccionarContrato(valor: string | null) {
    // Al cambiar de contrato se descartan las prioridades anteriores.
    setContrato(valor);
    setPrioridadesContrato([]);
    setPrioridad(null);
    setErrorCarga(null);
    const seleccionado = contratos.find((item) => contratoLabel(item) === valor);
    if (!seleccionado) return;
    try {
      // Las prioridades dependen del contrato; el supervisor ya viene asignado desde ese contrato.
      const detalle = await contratosApi.obtener(seleccionado.id);
      setPrioridadesContrato(detalle.prioridades ?? []);
    } catch (error) {
      setErrorCarga((error as Error).message);
    }
  }

  const plazoInfo = prioridad
    ? (() => {
        // El plazo viene de la configuración de prioridad del contrato, no de una constante global.
        const dias = prioridadesContrato.find((item) => item.nombre_prioridad === prioridad)?.dias_habiles ?? 0;
        const vencimiento = sumarDiasHabiles(new Date(), dias);
        return { dias, vencimiento };
      })()
    : null;

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

  function validar(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!contrato) nuevosErrores.contrato = 'Selecciona el contrato asociado.';
    if (contratoSeleccionado && !contratoSeleccionado.idSupervisor) {
      nuevosErrores.supervisor = 'El contrato seleccionado no tiene un supervisor asignado.';
    }
    if (!prioridad) nuevosErrores.prioridad = 'Selecciona una prioridad.';
    if (!descripcion.trim()) nuevosErrores.descripcion = 'Describe la observación.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function crear() {
    if (!validar() || !contratoSeleccionado?.idSupervisor) return;
    setGuardando(true);
    try {
      // Combina los campos de ubicación, ya que el esquema los almacena en una sola columna.
      const ubicacion = [direccion, sector, referencia, coordenadas].map((item) => item.trim()).filter(Boolean).join(', ');
      const prioridadSeleccionada = prioridadesContrato.find((item) => item.nombre_prioridad === prioridad);
      if (!prioridadSeleccionada) throw new Error('El contrato no tiene esa prioridad configurada.');
      // Se envían IDs de contrato, usuario y prioridad requeridos por sql/03.
      await ticketsApi.crear({
        id_contrato: Number(contratoSeleccionado.id),
        id_prioridad: prioridadSeleccionada.id_prioridad_contrato,
        descripcion: descripcion.trim(),
        ubicacion: ubicacion || null,
        direccion: direccion.trim() || null,
        sector: sector.trim() || null,
        referencia: referencia.trim() || null,
        ...coordenadasNumericas(coordenadas),
        fotos: fotos.map((foto) => foto.dataUrl),
      });
      // Refresca el resumen desde el servidor después de confirmar la creación.
      await cargarTickets();
      avisar('Ticket creado', 'El ticket quedó guardado en el servidor.');
      navigation.goBack();
    } catch (error) {
      avisar('No se pudo crear el ticket', (error as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar
        title="Nuevo ticket"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('Resumen')} accessibilityRole="button">
            <Text style={styles.verTickets}>Ver tickets</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={[styles.contenido, CONTENIDO_WEB]} keyboardShouldPersistTaps="handled">
        <TarjetaSeccion titulo="Datos del ticket" descripcion="Contrato, supervisor y prioridad de la observación.">
          <FilaCampos>
            <SelectField
              label="Contrato"
              requerido
              placeholder="Seleccionar contrato"
              value={contrato}
              options={opcionesContrato}
              onChange={seleccionarContrato}
              mensajeVacio="Aún no hay contratos cargados."
              error={errores.contrato}
            />
            <View>
              <Text style={styles.label}>Supervisor asignado al contrato</Text>
              <View style={[styles.input, styles.supervisorLectura]}>
                <Text style={contratoSeleccionado?.supervisorNombre ? styles.textoSupervisor : styles.textoSupervisorVacio}>
                  {contratoSeleccionado?.supervisorNombre ?? 'Se muestra al seleccionar un contrato'}
                </Text>
              </View>
              {!!errores.supervisor && <Text style={styles.error}>{errores.supervisor}</Text>}
            </View>
          </FilaCampos>
          {!!errorCarga && <Text style={styles.error}>{errorCarga}</Text>}

          <FilaCampos>
            <SelectField
              label="Prioridad"
              requerido
              placeholder="Seleccionar prioridad"
              value={prioridad}
              options={prioridadesContrato.map((item) => item.nombre_prioridad)}
              onChange={(v) => setPrioridad(v as Prioridad)}
              mensajeVacio="El contrato no tiene prioridades configuradas."
              error={errores.prioridad}
            />
            <View>
              <Text style={styles.label}>Plazo de subsanación</Text>
              <View style={[styles.input, styles.supervisorLectura]}>
                <Text style={plazoInfo ? styles.textoSupervisor : styles.textoSupervisorVacio}>
                  {plazoInfo
                    ? `${plazoInfo.dias} día(s) hábil(es) · vence el ${formatearFecha(plazoInfo.vencimiento)}`
                    : 'Se calcula al elegir la prioridad'}
                </Text>
              </View>
            </View>
          </FilaCampos>
        </TarjetaSeccion>

        <TarjetaSeccion titulo="Observación" descripcion="Describe lo observado y adjunta fotografías de respaldo.">
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

          <FotosField fotos={fotos} onChange={setFotos} />
        </TarjetaSeccion>

        <TarjetaSeccion titulo="Ubicación" descripcion="Usa la ubicación del dispositivo o ingrésala a mano.">
          <Button
            label={buscandoUbicacion ? 'Buscando ubicación…' : 'Usar mi ubicación actual'}
            variante="suave"
            onPress={usarUbicacionActual}
            disabled={buscandoUbicacion}
            cargando={buscandoUbicacion}
            style={styles.botonUbicacion}
          />
          {!!ubicacionError && <Text style={styles.error}>{ubicacionError}</Text>}

          <FilaCampos>
            <View>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                placeholder="Calle y número"
                placeholderTextColor={COLORS.textoTenue}
                value={direccion}
                onChangeText={setDireccion}
              />
            </View>
            <View>
              <Text style={styles.label}>Sector o lugar</Text>
              <TextInput
                style={styles.input}
                placeholder="Sector, plaza, recinto…"
                placeholderTextColor={COLORS.textoTenue}
                value={sector}
                onChangeText={setSector}
              />
            </View>
          </FilaCampos>
          <FilaCampos>
            <View>
              <Text style={styles.label}>Referencia de ubicación</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: frente de un negocio"
                placeholderTextColor={COLORS.textoTenue}
                value={referencia}
                onChangeText={setReferencia}
              />
            </View>
            <View>
              <Text style={styles.label}>Coordenadas</Text>
              <TextInput
                style={styles.input}
                placeholder="Se completa con la ubicación"
                placeholderTextColor={COLORS.textoTenue}
                value={coordenadas}
                onChangeText={setCoordenadas}
              />
            </View>
          </FilaCampos>
        </TarjetaSeccion>

        <View style={styles.auto}>
          <Text style={styles.autoTexto}>La fecha, la hora, el creador y el número del ticket se registran automáticamente.</Text>
        </View>
      </ScrollView>

      <View style={[styles.barraInferior, CONTENIDO_WEB]}>
        <Button label="Cancelar" variante="secundario" onPress={() => navigation.goBack()} style={styles.botonAccion} />
        <Button
          label={guardando ? 'Guardando…' : 'Crear'}
          variante="primario"
          onPress={crear}
          disabled={guardando}
          cargando={guardando}
          style={styles.botonAccion}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 20, paddingBottom: 24 },
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
  supervisorLectura: { justifyContent: 'center', backgroundColor: COLORS.fondo },
  textoSupervisor: { color: COLORS.textoPrimario, fontSize: 13 },
  textoSupervisorVacio: { color: COLORS.textoTenue, fontSize: 13 },
  error: { color: COLORS.rojo, fontSize: 11, marginTop: 4 },
  avisoVacio: { color: COLORS.textoSecundario, fontSize: 11.5, marginBottom: 6 },
  auto: {
    backgroundColor: COLORS.azulSuave,
    borderRadius: RADIOS.md,
    padding: 10,
    marginBottom: 8,
  },
  autoTexto: { fontSize: 11, color: COLORS.azulOscuro, lineHeight: 16, textAlign: 'center' },
  botonUbicacion: { marginBottom: 8 },
  verTickets: { color: COLORS.textoClaro, fontSize: 12.5, fontWeight: '700', paddingHorizontal: 8 },
  botonAccion: { flex: 1, maxWidth: 220 },
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
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.bordeSuave,
    backgroundColor: COLORS.superficie,
  },
});
