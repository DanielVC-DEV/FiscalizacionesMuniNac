import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import SelectField from '../components/SelectField';
import DateField from '../components/DateField';
import { OrdenCompra } from '../types';
import { addContrato } from '../data/store';
import { EMPRESAS_EJEMPLO } from '../data/datosTemporales';
import { parsearFecha } from '../utils/fechas';

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

  const empresaSeleccionada = EMPRESAS.find((e) => e.nombre === empresaNombre) ?? null;

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
      <View style={styles.linea} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.tituloFila}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Nuevo contrato</Text>
        </View>

        <Text style={styles.seccion}>DATOS DEL CONTRATO</Text>

        <Text style={styles.label}>
          Nombre del contrato
          <Text style={styles.req}> *</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mantención áreas verdes sector norte"
          placeholderTextColor="#8b93a0"
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

        <DateField label="Fecha de inicio" requerido value={fechaInicio} onChange={setFechaInicio} error={errores.fechaInicio} />
        <DateField
          label="Fecha de término"
          requerido
          value={fechaTermino}
          onChange={setFechaTermino}
          error={errores.fechaTermino}
        />

        <Text style={styles.label}>
          Día de respuesta a ticket
          <Text style={styles.req}> *</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Días hábiles, ej: 5"
          placeholderTextColor="#8b93a0"
          value={diasRespuesta}
          onChangeText={(v) => setDiasRespuesta(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />
        {!!errores.diasRespuesta && <Text style={styles.error}>{errores.diasRespuesta}</Text>}

        <Text style={styles.seccion}>ÓRDENES DE COMPRA (OPCIONAL)</Text>

        {ordenesCompra.map((oc, i) => (
          <View key={oc.id} style={styles.ocBloque}>
            <TouchableOpacity style={styles.ocCerrar} onPress={() => quitarOrdenCompra(oc.id)}>
              <Text style={styles.ocCerrarTexto}>×</Text>
            </TouchableOpacity>
            <Text style={styles.ocLabel}>Orden de compra {i + 1}</Text>

            <Text style={styles.label}>Código de la orden de compra</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 4521-2026"
              placeholderTextColor="#8b93a0"
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
              placeholderTextColor="#8b93a0"
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
          </View>
        ))}

        <TouchableOpacity style={styles.botonSecundario} onPress={agregarOrdenCompra}>
          <Text style={styles.botonSecundarioTexto}>+ Agregar orden de compra</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.barraInferior}>
        <TouchableOpacity style={styles.botonClaro} onPress={() => navigation.goBack()}>
          <Text style={styles.botonClaroTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botonOscuroFull, { flex: 1, marginTop: 0 }]} onPress={crear}>
          <Text style={styles.botonOscuroTexto}>Crear contrato</Text>
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
    justifyContent: 'center',
  },
  inputDeshabilitado: { backgroundColor: '#eceef0' },
  valorTexto: { color: '#1c2126', fontSize: 13 },
  placeholderTexto: { color: '#8b93a0', fontSize: 13 },
  error: { color: '#7c0101', fontSize: 11, marginTop: -4, marginBottom: 6 },
  filaDoble: { flexDirection: 'row', gap: 10 },
  ocBloque: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e6ea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  ocCerrar: { position: 'absolute', top: 8, right: 10, zIndex: 1 },
  ocCerrarTexto: { fontSize: 16, color: '#9aa3ad', fontWeight: '700' },
  ocLabel: { fontSize: 11, color: '#5b6570', fontWeight: '700', marginBottom: 4 },
  botonSecundario: {
    borderWidth: 1,
    borderColor: '#9aa3ad',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  botonSecundarioTexto: { color: '#5b6570', fontSize: 12.5, fontWeight: '700' },
  botonOscuroFull: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#686462',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonOscuroTexto: { color: '#fff', fontSize: 12.5, fontWeight: '600', textAlign: 'center' },
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
