import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import SeccionLabel from '../../core/ui/SeccionLabel';
import { avisar } from '../../core/ui/avisos';
import { COLORS, COLOR_ESTADO, RADIOS } from '../../core/theme/colors';
import { reportesApi, IndicadoresApi, FiltrosReporte } from './api';
import { CONTENIDO_WEB } from '../../core/ui/anchoWeb';
import GraficoBarras from './components/GraficoBarras';
import BarraEstados from './components/BarraEstados';
import GraficoMensual from './components/GraficoMensual';

type Periodo = 'mes' | 'trimestre' | 'todo';

const OPCIONES_PERIODO: { clave: Periodo; etiqueta: string }[] = [
  { clave: 'mes', etiqueta: 'Este mes' },
  { clave: 'trimestre', etiqueta: 'Este trimestre' },
  { clave: 'todo', etiqueta: 'Todo' },
];

function aISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

// Filtro por fecha de creación según el periodo elegido.
function filtrosDelPeriodo(periodo: Periodo): FiltrosReporte {
  const hoy = new Date();
  if (periodo === 'mes') return { creada_desde: aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)) };
  if (periodo === 'trimestre') {
    return { creada_desde: aISO(new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1)) };
  }
  return {};
}

function dias(valor: string | null): string {
  return valor === null ? 'Sin datos' : `${Number(valor).toLocaleString('es-CL')} días`;
}

export default function IndicadoresScreen({ navigation }: any) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [datos, setDatos] = useState<IndicadoresApi | null>(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (periodoElegido: Periodo) => {
    setCargando(true);
    try {
      setDatos(await reportesApi.indicadores(filtrosDelPeriodo(periodoElegido)));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar(periodo);
    }, [cargar, periodo]),
  );

  async function descargarPdf() {
    setDescargando(true);
    try {
      await reportesApi.descargarPdf(filtrosDelPeriodo(periodo));
    } catch (err) {
      avisar('No se pudo descargar el PDF', (err as Error).message);
    } finally {
      setDescargando(false);
    }
  }

  const porcentaje = (parte: number, todo: number) => (todo ? `${Math.round((parte / todo) * 100)}%` : '-');

  // Cifras principales: se muestran grandes arriba, como en la portada del PDF.
  const principales = datos
    ? [
        { etiqueta: 'Total de tickets', valor: String(datos.total), color: COLORS.azul },
        { etiqueta: 'Pendientes de revisión', valor: String(datos.pendientes_revision), color: COLORS.amarillo },
        { etiqueta: 'Vencidos', valor: String(datos.vencidos), color: COLORS.rojo },
        {
          etiqueta: 'Respuestas en plazo',
          valor: porcentaje(datos.respuestas_en_plazo, datos.respuestas_con_dato),
          color: COLORS.verde,
        },
      ]
    : [];

  const tramosEstado = datos
    ? [
        { etiqueta: 'Abiertos', valor: datos.abiertos, color: COLOR_ESTADO.ABIERTO.color },
        { etiqueta: 'Pendientes de revisión', valor: datos.pendientes_revision, color: COLOR_ESTADO.RESPONDIDO.color },
        { etiqueta: 'Nueva subsanación', valor: datos.requieren_nueva_subsanacion, color: '#c25b00' },
        { etiqueta: 'Vencidos', valor: datos.vencidos, color: COLOR_ESTADO.VENCIDO.color },
        { etiqueta: 'Subsanados conforme', valor: datos.subsanados_conforme, color: COLOR_ESTADO.SUBSANADO_CONFORME.color },
        { etiqueta: 'Cerrados', valor: datos.cerrados, color: COLOR_ESTADO.CERRADO.color },
      ]
    : [];

  const filasReparto = (lista: IndicadoresApi['por_empresa']) =>
    lista.map((f) => ({
      etiqueta: f.nombre,
      valor: f.total,
      detalle: `${f.resueltos} resueltos · ${f.vencidos} vencidos`,
    }));

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Indicadores" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.contenido, CONTENIDO_WEB]}>
        <View style={styles.periodos}>
          {OPCIONES_PERIODO.map((opcion) => (
            <TouchableOpacity
              key={opcion.clave}
              style={[styles.periodo, periodo === opcion.clave && styles.periodoActivo]}
              onPress={() => setPeriodo(opcion.clave)}
            >
              <Text style={[styles.periodoTexto, periodo === opcion.clave && styles.periodoTextoActivo]}>
                {opcion.etiqueta}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {cargando && !datos && <ActivityIndicator color={COLORS.azul} style={styles.cargando} />}
        {!!error && <Text style={styles.error}>{error}</Text>}

        {datos && (
          <>
            <View style={styles.grilla}>
              {principales.map((tarjeta) => (
                <View key={tarjeta.etiqueta} style={[styles.tarjeta, { backgroundColor: tarjeta.color }]}>
                  <Text style={styles.numero}>{tarjeta.valor}</Text>
                  <Text style={styles.etiqueta}>{tarjeta.etiqueta}</Text>
                </View>
              ))}
            </View>

            <SeccionLabel texto="Tickets por estado" />
            <Card>
              <BarraEstados tramos={tramosEstado} total={datos.total} />
            </Card>

            <SeccionLabel texto="Evolución mensual" />
            <Card>
              <GraficoMensual meses={datos.por_mes} />
            </Card>

            <SeccionLabel texto="Tiempos promedio" />
            <Card style={styles.tiempos}>
              <Text style={styles.tiempoEtiqueta}>Hasta la primera respuesta</Text>
              <Text style={styles.tiempoValor}>{dias(datos.tiempo_promedio_respuesta_dias)}</Text>
              <Text style={[styles.tiempoEtiqueta, styles.separado]}>Hasta el cierre</Text>
              <Text style={styles.tiempoValor}>{dias(datos.tiempo_promedio_cierre_dias)}</Text>
            </Card>

            <SeccionLabel texto="Por empresa" />
            <Card>
              <GraficoBarras filas={filasReparto(datos.por_empresa)} />
            </Card>

            <SeccionLabel texto="Por área" />
            <Card>
              <GraficoBarras filas={filasReparto(datos.por_area)} />
            </Card>

            <SeccionLabel texto="Por prioridad" />
            <Card>
              <GraficoBarras filas={filasReparto(datos.por_prioridad)} />
            </Card>

            <SeccionLabel texto="Reporte" />
            {Platform.OS === 'web' ? (
              <Button label="Descargar reporte PDF" onPress={descargarPdf} cargando={descargando} />
            ) : (
              <Text style={styles.nota}>El reporte PDF se descarga desde la versión web de la plataforma.</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 28, gap: 12 },
  periodos: { flexDirection: 'row', gap: 8 },
  periodo: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIOS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
  },
  periodoActivo: { backgroundColor: COLORS.azul, borderColor: COLORS.azul },
  periodoTexto: { fontSize: 12, fontWeight: '600', color: COLORS.textoPrimario },
  periodoTextoActivo: { color: COLORS.textoClaro },
  cargando: { marginTop: 24 },
  error: { color: COLORS.rojo, fontSize: 13 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tarjeta: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 130,
    padding: 14,
    borderRadius: RADIOS.md,
    gap: 2,
  },
  numero: { fontSize: 28, fontWeight: '800', color: COLORS.textoClaro },
  etiqueta: { fontSize: 11, fontWeight: '600', color: COLORS.textoClaro },
  tiempos: { gap: 2 },
  tiempoEtiqueta: { fontSize: 11, fontWeight: '700', color: COLORS.textoSecundario },
  tiempoValor: { fontSize: 16, fontWeight: '700', color: COLORS.textoPrimario },
  separado: { marginTop: 10 },
  nota: { fontSize: 12, color: COLORS.textoSecundario, fontStyle: 'italic' },
});
