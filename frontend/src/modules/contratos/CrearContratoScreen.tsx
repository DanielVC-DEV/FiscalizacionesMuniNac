import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../core/ui/Header';
import TopBar from '../../core/ui/TopBar';
import SelectField from '../../core/ui/SelectField';
import DateField from '../../core/ui/DateField';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { OrdenCompra } from './types';
import { empresasApi, EmpresaApi } from '../empresas/api';
import { contratosApi } from './api';
import { cargarContratos } from './store';
import { parsearFecha, diferenciaEnDias, hoyComoTexto } from '../../core/utils/fechas';
import OrdenCompraBloque from './components/OrdenCompraBloque';

export default function CrearContratoScreen({ navigation }: any) {
  const [nombreContrato, setNombreContrato] = useState('');
  const [empresaOpcion, setEmpresaOpcion] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaApi[]>([]);
  const [supervisorOpcion, setSupervisorOpcion] = useState<string | null>(null);
  const [supervisores, setSupervisores] = useState<{ id_usuario: number; nombre: string; email: string }[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
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

  const empresaSeleccionada = empresas.find((e) => `${e.razon_social} — ${e.rut}` === empresaOpcion) ?? null;
  const opcionesEmpresa = empresas.map((e) => `${e.razon_social} — ${e.rut}`);
  const supervisorSeleccionado = supervisores.find(
    (item) => `${item.nombre} — ${item.email}` === supervisorOpcion
  );

  async function seleccionarEmpresa(valor: string) {
    setEmpresaOpcion(valor);
    setSupervisorOpcion(null);
    setSupervisores([]);
    setErrorCarga(null);
    const empresa = empresas.find((item) => `${item.razon_social} — ${item.rut}` === valor);
    if (!empresa) return;
    try {
      setSupervisores(await empresasApi.listarSupervisores(empresa.id_empresa));
    } catch (error) {
      setErrorCarga((error as Error).message);
    }
  }

  useEffect(() => {
    // Carga las empresas reales para que el contrato se guarde con su ID de base de datos.
    empresasApi.listar()
      .then(setEmpresas)
      .catch((error: Error) => setErrorCarga(error.message));
  }, []);

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
    // Reúne los errores antes de enviar datos para evitar peticiones incompletas.
    const nuevosErrores: Record<string, string> = {};
    if (!nombreContrato.trim()) nuevosErrores.nombreContrato = 'Ingresa el nombre del contrato.';
    if (!empresaOpcion) nuevosErrores.empresa = 'Selecciona la empresa.';
    if (!supervisorOpcion) nuevosErrores.supervisor = 'Selecciona el supervisor del contrato.';

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
      if (!oc.monto.trim() || !/^[1-9]\d*$/.test(oc.monto.trim())) {
        nuevosErrores[`ocMonto_${oc.id}`] = 'Ingresa un monto válido.';
      }
      if (!oc.fecha.trim()) nuevosErrores[`ocFecha_${oc.id}`] = 'Selecciona la fecha.';
      else if (!parsearFecha(oc.fecha)) nuevosErrores[`ocFecha_${oc.id}`] = 'La fecha no es válida.';
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function fechaParaApi(texto: string): string {
    // El formulario usa dd/mm/aaaa y PostgreSQL espera una fecha ISO yyyy-mm-dd.
    const fecha = parsearFecha(texto)!;
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  async function crear() {
    if (!validar() || !empresaSeleccionada || !supervisorSeleccionado) return;
    setGuardando(true);
    try {
      // Primero crea el contrato y obtiene su ID generado por PostgreSQL.
      const creado = await contratosApi.crear({
        nombre: nombreContrato.trim(),
        id_empresa: empresaSeleccionada.id_empresa,
        id_supervisor: supervisorSeleccionado.id_usuario,
        fecha_inicio: fechaParaApi(fechaInicio),
        fecha_termino: fechaParaApi(fechaTermino),
        dia_respuesta: Number(diasRespuesta),
      });

  // Las órdenes se guardan aparte porque el backend expone un endpoint por contrato.
      for (const orden of ordenesCompra.filter((item) => item.monto.trim() || item.fecha.trim())) {
        await contratosApi.agregarOrdenCompra(String(creado.id_contratos), {
          monto: Number(orden.monto),
          fecha_compra: fechaParaApi(orden.fecha),
        });
      }

  // Recarga el listado para mostrar el registro persistido, no una copia temporal.
      await cargarContratos();
      Alert.alert('Contrato creado', 'El contrato quedó guardado en el servidor.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('No se pudo crear el contrato', (error as Error).message);
    } finally {
      setGuardando(false);
    }
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
          value={empresaOpcion}
          options={opcionesEmpresa}
          onChange={seleccionarEmpresa}
          mensajeVacio="Aún no hay empresas registradas."
          error={errores.empresa}
        />

        <SelectField
          label="Supervisor del contrato"
          requerido
          placeholder="Seleccionar supervisor"
          value={supervisorOpcion}
          options={supervisores.map((item) => `${item.nombre} — ${item.email}`)}
          onChange={setSupervisorOpcion}
          mensajeVacio={empresaSeleccionada ? 'La empresa no tiene supervisores registrados.' : 'Selecciona primero una empresa.'}
          error={errores.supervisor}
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

        {!!errorCarga && <Text style={styles.error}>{errorCarga}</Text>}

        <Text style={styles.seccion}>ÓRDENES DE COMPRA (OPCIONAL)</Text>

        {ordenesCompra.map((oc, i) => (
          <OrdenCompraBloque
            key={oc.id}
            oc={oc}
            indice={i}
            errorMonto={errores[`ocMonto_${oc.id}`]}
            errorFecha={errores[`ocFecha_${oc.id}`]}
            onQuitar={() => quitarOrdenCompra(oc.id)}
            onActualizar={(campo, valor) => actualizarOrdenCompra(oc.id, campo, valor)}
          />
        ))}

        <Button label="+ Agregar orden de compra" variante="punteado" onPress={agregarOrdenCompra} style={styles.botonAgregar} />
      </ScrollView>

      <View style={styles.barraInferior}>
        <Button label="Cancelar" variante="secundario" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <Button
          label={guardando ? 'Guardando…' : 'Crear contrato'}
          variante="primario"
          onPress={crear}
          disabled={guardando}
          cargando={guardando}
          style={{ flex: 1 }}
        />
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
