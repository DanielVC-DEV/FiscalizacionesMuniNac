import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import { COLORS, COLOR_ESTADO, RADIOS } from '../../core/theme/colors';
import { esFechaPasada } from '../../core/utils/fechas';
import { cargarTickets, useTickets } from '../tickets/store';
import { Ticket, EstadoTicket } from '../tickets/types';
import Stat from './components/Stat';
import FilaEstado from './components/FilaEstado';

const OPCIONES_PERIODO = ['Este mes', 'Este trimestre', 'Todo'];

export default function ResumenScreen({ navigation }: any) {
  // Tickets reales, creados en "Nuevo ticket" (almacén en memoria,
  // modules/tickets/store.ts). Se actualiza sola apenas se crea un ticket.
  const TICKETS = useTickets();

  const [periodo, setPeriodo] = useState(OPCIONES_PERIODO[0]);
  const [busqueda, setBusqueda] = useState('');
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // "Vencido" depende de la fecha de hoy, no solo de si cambió algún
  // ticket. Si dejas esta pantalla abierta de un día para otro, o sales y
  // vuelves a entrar, esto fuerza a recalcular con la fecha actual para
  // que un ticket que recién venció se vea reflejado altiro.
  const [, refrescar] = useState(0);
  useFocusEffect(
    useCallback(() => {
      refrescar((n) => n + 1);
      // Recarga tickets al entrar y conserva el aviso si el servidor no está disponible.
      cargarTickets().catch((error: Error) => setErrorCarga(error.message));
    }, []),
  );

  function siguientePeriodo() {
    const i = OPCIONES_PERIODO.indexOf(periodo);
    setPeriodo(OPCIONES_PERIODO[(i + 1) % OPCIONES_PERIODO.length]);
  }

  const texto = busqueda.trim().toLowerCase();
  const filtrados = TICKETS.filter((t) => {
    if (!texto) return true;
    return (
      t.id.toLowerCase().includes(texto) ||
      t.contrato.toLowerCase().includes(texto) ||
      t.descripcion.toLowerCase().includes(texto)
    );
  });

  // "VENCIDO" no es un estado guardado (sección 13 del informe): se
  // calcula comparando la fecha de vencimiento con hoy, y solo cuenta si
  // el ticket todavía no fue subsanado conforme ni cerrado.
  function esVencido(t: Ticket): boolean {
    return esFechaPasada(t.fechaVencimiento) && t.estado !== 'SUBSANADO_CONFORME' && t.estado !== 'CERRADO';
  }

  const porEstado = (estado: EstadoTicket) => filtrados.filter((t) => t.estado === estado);
  const pendientesRevision = porEstado('RESPONDIDO').length;
  const vencidos = filtrados.filter(esVencido).length;
  const requierenNuevaSubsanacion = porEstado('REQUIERE_NUEVA_SUBSANACION').length;

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Resumen de tickets" onBack={() => navigation.goBack()} />

      <View style={styles.contenido}>
        <View style={styles.filaAtencion}>
          <Text style={styles.tituloSeccion}>Requiere atención</Text>
          <TouchableOpacity style={styles.periodo} onPress={siguientePeriodo}>
            <Text style={styles.periodoTexto}>{periodo} ▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filaStats}>
          <Stat
            etiqueta={'Pendientes\nde revisión'}
            numero={pendientesRevision}
            color={COLOR_ESTADO.RESPONDIDO.color}
            suave={COLOR_ESTADO.RESPONDIDO.suave}
            oscuro={COLOR_ESTADO.RESPONDIDO.oscuro}
          />
          <Stat
            etiqueta="Vencidos"
            numero={vencidos}
            color={COLOR_ESTADO.VENCIDO.color}
            suave={COLOR_ESTADO.VENCIDO.suave}
            oscuro={COLOR_ESTADO.VENCIDO.oscuro}
          />
          <Stat
            etiqueta={'Requieren nueva\nsubsanación'}
            numero={requierenNuevaSubsanacion}
            color={COLOR_ESTADO.REQUIERE_NUEVA_SUBSANACION.color}
            suave={COLOR_ESTADO.REQUIERE_NUEVA_SUBSANACION.suave}
            oscuro={COLOR_ESTADO.REQUIERE_NUEVA_SUBSANACION.oscuro}
          />
        </View>

        <Text style={styles.tituloSeccion}>Estado general</Text>
        {!!errorCarga && <Text style={styles.sinTickets}>No se pudo cargar el servidor: {errorCarga}</Text>}

        <TextInput
          style={styles.buscador}
          placeholder="Buscar por contrato o descripción"
          placeholderTextColor={COLORS.textoTenue}
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <FilaEstado etiqueta="Abiertos" estadoClave="ABIERTO" tickets={porEstado('ABIERTO')} />
        <FilaEstado etiqueta="Respondidos" estadoClave="RESPONDIDO" tickets={porEstado('RESPONDIDO')} />
        <FilaEstado etiqueta="Subsanados" estadoClave="SUBSANADO_CONFORME" tickets={porEstado('SUBSANADO_CONFORME')} />
        <FilaEstado etiqueta="Cerrados" estadoClave="CERRADO" tickets={porEstado('CERRADO')} />
        <FilaEstado etiqueta="Total" tickets={filtrados} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 24 },
  filaAtencion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tituloSeccion: { fontSize: 14, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 10 },
  periodo: {
    backgroundColor: COLORS.superficie,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    borderRadius: RADIOS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  periodoTexto: { fontSize: 11.5, color: COLORS.textoPrimario, fontWeight: '600' },
  filaStats: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  buscador: {
    height: 44,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    marginBottom: 16,
  },
  sinTickets: { color: COLORS.textoSecundario, fontSize: 12, fontStyle: 'italic' },
});
