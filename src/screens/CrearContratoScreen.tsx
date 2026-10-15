import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import SelectField from '../components/SelectField';
import DateField from '../components/DateField';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, RADIOS } from '../theme/colors';
import { OrdenCompra } from '../types';
import { addContrato } from '../data/store';
import { EMPRESAS_EJEMPLO } from '../data/datosTemporales';
import { parsearFecha, diferenciaEnDias, hoyComoTexto } from '../utils/fechas';

// EMPRESAS_EJEMPLO es data de ejemplo temporal (ver src/data/datosTemporales.ts):
// todavía no existe una administración real de empresas.
const EMPRESAS = EMPRESAS_EJEMPLO;

export default function CrearContratoScreen({ navigation }: any) {
  const [nombreContrato, setNombreContrato] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');
  const [diasRespuesta, setDiasRespuesta] = useState('');
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Sirve para forzar que el campo "Fecha de inicio" se vuelva a montar
  // cuando se usa el botón "Usar fecha de hoy": DateField guarda su propio
  // día/mes/año como estado interno (ver el comentario en DateField.tsx),
  // así que cambiar solo la prop `value` desde acá no lo actualiza visualmente.
  const [fechaInicioResetId, setFechaInicioResetId] = useState(0);

  const empresaSeleccionada = EMPRESAS.find((e) => e.nombre === empresaNombre) ?? null;

  // Si ambas fechas quedan completas y coherentes, el día de respuesta a
  // ticket se calcula solo como la cantidad de días entre inicio y
  // término, en vez de que la persona lo tenga que contar a mano.
  function recalcularDiasRespuesta(inicioTexto: string, terminoTexto: string) {
    const inicio = parsearFecha(inicioTexto);
    const termino = parsearFecha(terminoTexto);
    if (inicio && termino && termino > inicio) {
      setDiasRespuesta(String(diferenciaEnDias(inicio, termino)));
    }
  }

  function manejarFechaInicio(valor: string) {
    setFechaInicio(valor);
    recalcularDiasRespuesta(valor, fechaTermino);
  }

  function manejarFechaTermino(valor: string) {
    setFechaTermino(valor);
    recalcularDiasRespuesta(fechaInicio, valor);
  }

  function usarFechaActual() {
    const hoy = hoyComoTexto();
    setFechaInicio(hoy);
    setFechaInicioResetId((n) => n + 1);
    recalcularDiasRespuesta(hoy, fechaTermino);
  }

  function agregarOrdenCompra() {
    setOrdenesCompra((prev) => [...prev, { id: `${Date.now()}`, codigo: '', monto: '', fecha: '' }]);
  }

  function quitarOrdenCompra(id: string) {
    setOrdenesCompra((prev) => prev.filter((oc) => oc.id !== id));
  }

  function actualizarOrdenCompra(id: string, campo: keyof OrdenCompra, valor: string) {
    setOrdenesCompra((prev) => prev.map((oc) => (oc.id === id ? { ...oc, [campo]: valor } : oc)));
  }

  function validar(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!nombreContrato.trim()) nuevosErrores.nombreContrato = 'Ingresa el nombre del contrato.';
    if (!empresaNombre) nuevosErrores.empresa = 'Selecciona la empresa.';

    const inicio = parsearFecha(fechaInicio);
    const termino = parsearFecha(fechaTermino);
    if (!fechaInicio.trim()) nuevosErrores.fechaInicio = 'Selecciona la fecha de inicio.';
    else if (!inicio) nuevosErrores.fechaInicio = 'La fecha de inicio no es válida.';

    if (!fechaTermino.trim()) nuevosErrores.fechaTermino = 'Selecciona la fecha de término.';
    else if (!termino) nuevosErrores.fechaTermino = 'La fecha de término no es válida.';
    else if (inicio && termino <= inicio) {
      nuevosErrores.fechaTermino = 'La fecha de término debe ser posterior a la fecha de inicio.';
    }

    if (!diasRespuesta.trim()) {
      nuevosErrores.diasRespuesta = 'Ingresa el día de respuesta a ticket.';
    } else if (!/^[1-9]\d*$/.test(diasRespuesta.trim())) {
      nuevosErrores.diasRespuesta = 'Debe ser un número mayor a 0.';
    }

    ordenesCompra.forEach((oc) => {
      const algoLleno = oc.codigo.trim() || oc.monto.trim() || oc.fecha.trim();
      if (!algoLleno) return; // bloque vacío: se descarta al guardar, no se valida
      if (!oc.codigo.trim()) nuevosErrores[`ocCodigo_${oc.id}`] = 'Ingresa el código de la orden de compra.';
      if (!oc.monto.trim() || !/^[1-9]\d*$/.test(oc.monto.trim())) {
        nuevosErrores[`ocMonto_${oc.id}`] = 'Ingresa un monto válido.';
      }
      if (!oc.fecha.trim()) nuevosErrores[`ocFecha_${oc.id}`] = 'Selecciona la fecha.';
      else if (!parsearFecha(oc.fecha)) nuevosErrores[`ocFecha_${oc.id}`] = 'La fecha no es válida.';
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function crear() {
    if (!validar()) return;
    // Todavía no hay backend: esto se guarda en el almacén en memoria
    // (src/data/store.ts), que dura mientras la app esté abierta. Así el
    // contrato ya aparece en el listado de Contratos y como opción al
    // crear un ticket. Cuando exista el backend, esto se reemplaza por un
    // guardado real.
    addContrato({
      id: `${Date.now()}`,
      nombre: nombreContrato.trim(),
      rutEmpresa: empresaSeleccionada?.rut ?? '',
      nombreEmpresa: empresaSeleccionada?.nombre ?? '',
      fechaInicio: fechaInicio.trim(),
      fechaTermino: fechaTermino.trim(),
      diasRespuestaTicket: Number(diasRespuesta) || 0,
      ordenesCompra: ordenesCompra.filter((oc) => oc.codigo.trim() || oc.monto.trim() || oc.fecha.trim()),
    });
    Alert.alert('Contrato creado', 'Ya puedes verlo en el listado y elegirlo al crear un ticket.');
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Nuevo contrato" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.seccion}>DATOS DEL CONTRATO</Text>

        <Text style={styles.label}>
          Nombre del contrato
          <Text style={styles.req}> *</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mantención áreas verdes sector norte"
          placeholderTextColor={COLORS.textoTenue}
          value={nombreContrato}
          onChangeText={setNombreContrato}
        />
        {!!errores.nombreContrato && <Text style={styles.error}>{errores.nombreContrato}</Text>}

        <SelectField
          label="Empresa"
          requerido
          placeholder="Seleccionar empresa registrada"
          value={empresaNombre}
          options={EMPRESAS.map((e) => e.nombre)}
          onChange={setEmpresaNombre}
          mensajeVacio="Aún no hay empresas registradas."
          error={errores.empresa}
        />

        <Text style={styles.label}>RUT de la empresa</Text>
        <View style={[styles.input, styles.inputDeshabilitado]}>
          <Text style={empresaSeleccionada ? styles.valorTexto : styles.placeholderTexto}>
            {empresaSeleccionada ? empresaSeleccionada.rut : 'Se completa al elegir la empresa'}
          </Text>
        </View>

        <DateField
          key={`fecha-inicio-${fechaInicioResetId}`}
          label="Fecha de inicio"
          requerido
          value={fechaInicio}
          onChange={manejarFechaInicio}
          error={errores.fechaInicio}
        />
        <Button
          label="Usar fecha de hoy"
          variante="suave"
          onPress={usarFechaActual}
          style={styles.botonFechaActual}
        />

        <DateField
          label="Fecha de término"
          requerido
          value={fechaTermino}
          onChange={manejarFechaTermino}
          error={errores.fechaTermino}
        />

        <Text style={styles.label}>
          Día de respuesta a ticket
          <Text style={styles.req}> *</Text>
        </Text>
        <Text style={styles.ayuda}>Se calcula solo según la fecha de inicio y de término, pero puedes cambiarlo a mano.</Text>
        <TextInput
          style={styles.input}
          placeholder="Días hábiles, ej: 5"
          placeholderTextColor={COLORS.textoTenue}
          value={diasRespuesta}
          onChangeText={(v) => setDiasRespuesta(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
        {!!errores.diasRespuesta && <Text style={styles.error}>{errores.diasRespuesta}</Text>}

        <Text style={styles.seccion}>ÓRDENES DE COMPRA (OPCIONAL)</Text>

        {ordenesCompra.map((oc, i) => (
          <Card key={oc.id} style={styles.ocBloque}>
            <TouchableOpacity style={styles.ocCerrar} onPress={() => quitarOrdenCompra(oc.id)}>
              <Text style={styles.ocCerrarTexto}>×</Text>
            </TouchableOpacity>
            <Text style={styles.ocLabel}>Orden de compra {i + 1}</Text>

            <Text style={styles.label}>Código de la orden de compra</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 4521-2026"
              placeholderTextColor={COLORS.textoTenue}
              value={oc.codigo}
              onChangeText={(v) => actualizarOrdenCompra(oc.id, 'codigo', v)}
            />
            {!!errores[`ocCodigo_${oc.id}`] && (
              <Text style={styles.error}>{errores[`ocCodigo_${oc.id}`]}</Text>
            )}

            <Text style={styles.label}>Monto</Text>
            <TextInput
              style={styles.input}
              placeholder="$"
              placeholderTextColor={COLORS.textoTenue}
              value={oc.monto}
              onChangeText={(v) => actualizarOrdenCompra(oc.id, 'monto', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />
            {!!errores[`ocMonto_${oc.id}`] && <Text style={styles.error}>{errores[`ocMonto_${oc.id}`]}</Text>}

            <DateField
              label="Fecha"
              value={oc.fecha}
              onChange={(v) => actualizarOrdenCompra(oc.id, 'fecha', v)}
              error={errores[`ocFecha_${oc.id}`]}
            />
          </Card>
        ))}

        <Button label="+ Agregar orden de compra" variante="punteado" onPress={agregarOrdenCompra} style={styles.botonAgregar} />
      </ScrollView>

      <View style={styles.barraInferior}>
        <Button label="Cancelar" variante="secundario" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <Button label="Crear contrato" variante="primario" onPress={crear} style={{ flex: 1 }} />
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
    justifyContent: 'center',
  },
  inputDeshabilitado: { backgroundColor: COLORS.fondo },
  valorTexto: { color: COLORS.textoPrimario, fontSize: 13 },
  placeholderTexto: { color: COLORS.textoTenue, fontSize: 13 },
  error: { color: COLORS.rojo, fontSize: 11, marginTop: -4, marginBottom: 6 },
  ayuda: { color: COLORS.textoSecundario, fontSize: 11, marginTop: -2, marginBottom: 6, fontStyle: 'italic' },
  botonFechaActual: { alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 12, marginTop: -4, marginBottom: 10 },
  ocBloque: { marginBottom: 10 },
  ocCerrar: { position: 'absolute', top: 10, right: 12, zIndex: 1 },
  ocCerrarTexto: { fontSize: 16, color: COLORS.textoTenue, fontWeight: '700' },
  ocLabel: { fontSize: 11, color: COLORS.azul, fontWeight: '700', marginBottom: 4 },
  botonAgregar: { marginBottom: 6 },
  barraInferior: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.bordeSuave,
    backgroundColor: COLORS.superficie,
  },
});
