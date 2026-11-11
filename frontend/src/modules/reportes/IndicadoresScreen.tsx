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

  const tarjetas: { etiqueta: string; numero: number; estado?: string }[] = datos
    ? [
        { etiqueta: 'Total de tickets', numero: datos.total },
        { etiqueta: 'Abiertos', numero: datos.abiertos, estado: 'ABIERTO' },
        { etiqueta: 'Pendientes de revisión', numero: datos.pendientes_revision, estado: 'RESPONDIDO' },
        { etiqueta: 'Nueva subsanación', numero: datos.requieren_nueva_subsanacion, estado: 'REQUIERE_NUEVA_SUBSANACION' },
        { etiqueta: 'Vencidos', numero: datos.vencidos, estado: 'VENCIDO' },
        { etiqueta: 'Subsanados conforme', numero: datos.subsanados_conforme, estado: 'SUBSANADO_CONFORME' },
        { etiqueta: 'Cerrados', numero: datos.cerrados, estado: 'CERRADO' },
      ]
    : [];

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
              {tarjetas.map((tarjeta) => {
                const color = tarjeta.estado ? COLOR_ESTADO[tarjeta.estado] : null;
                return (
                  <View
                    key={tarjeta.etiqueta}
                    style={[styles.tarjeta, color && { backgroundColor: color.suave, borderColor: color.color }]}
                  >
                    <Text style={[styles.numero, color && { color: color.oscuro }]}>{tarjeta.numero}</Text>
                    <Text style={[styles.etiqueta, color && { color: color.oscuro }]}>{tarjeta.etiqueta}</Text>
                  </View>
                );
              })}
            </View>

            <SeccionLabel texto="Tiempos promedio" />
            <Card style={styles.tiempos}>
              <Text style={styles.tiempoEtiqueta}>Hasta la primera respuesta</Text>
              <Text style={styles.tiempoValor}>{dias(datos.tiempo_promedio_respuesta_dias)}</Text>
              <Text style={[styles.tiempoEtiqueta, styles.separado]}>Hasta el cierre</Text>
              <Text style={styles.tiempoValor}>{dias(datos.tiempo_promedio_cierre_dias)}</Text>
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
    flexBasis: '30%',
    minWidth: 100,
    padding: 12,
    borderRadius: RADIOS.md,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    backgroundColor: COLORS.superficie,
    gap: 2,
  },
  numero: { fontSize: 24, fontWeight: '800', color: COLORS.azul },
  etiqueta: { fontSize: 11, fontWeight: '600', color: COLORS.textoSecundario },
  tiempos: { gap: 2 },
  tiempoEtiqueta: { fontSize: 11, fontWeight: '700', color: COLORS.textoSecundario },
  tiempoValor: { fontSize: 16, fontWeight: '700', color: COLORS.textoPrimario },
  separado: { marginTop: 10 },
  nota: { fontSize: 12, color: COLORS.textoSecundario, fontStyle: 'italic' },
});
