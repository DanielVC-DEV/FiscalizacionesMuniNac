import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import EstadoBadge from '../components/EstadoBadge';
import { COLORS, COLOR_ESTADO, RADIOS } from '../theme/colors';
import { cargarTickets, useTickets } from '../data/store';
import { Ticket, EstadoTicket } from '../types';
import { esFechaPasada } from '../utils/fechas';

const OPCIONES_PERIODO = ['Este mes', 'Este trimestre', 'Todo'];

export default function ResumenScreen({ navigation }: any) {
  // Tickets reales, creados en "Nuevo ticket" (almacén en memoria,
  // src/data/store.ts). Ya no es una lista vacía fija: se actualiza sola
  // apenas se crea un ticket.
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

function Stat({
  etiqueta,
  numero,
  color,
  suave,
  oscuro,
}: {
  etiqueta: string;
  numero: number;
  color: string;
  suave: string;
  oscuro: string;
}) {
  return (
    <View style={[styles.stat, { backgroundColor: suave, borderColor: color }]}>
      <Text style={[styles.statTexto, { color: oscuro }]}>{etiqueta}</Text>
      <Text style={[styles.statNumero, { color }]}>{numero}</Text>
    </View>
  );
}

// Cada fila es un acordeón: muestra el nombre del estado y el total, y al
// tocarla se despliega la lista de tickets de ese estado.
function FilaEstado({
  etiqueta,
  estadoClave,
  tickets,
}: {
  etiqueta: string;
  estadoClave?: EstadoTicket;
  tickets: Ticket[];
}) {
  const [abierto, setAbierto] = useState(false);
  const color = estadoClave ? COLOR_ESTADO[estadoClave].color : COLORS.azul;

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity style={styles.barra} onPress={() => setAbierto((v) => !v)} activeOpacity={0.75}>
        <View style={styles.barraIzquierda}>
          <View style={[styles.barraMarca, { backgroundColor: color }]} />
          <Text style={styles.barraTexto}>{etiqueta}</Text>
        </View>
        <View style={styles.barraDerecha}>
          <Text style={styles.barraNumero}>{tickets.length}</Text>
          <Text style={styles.barraChevron}>{abierto ? '▴' : '▾'}</Text>
        </View>
      </TouchableOpacity>
      {abierto && (
        <View style={styles.desplegable}>
          {tickets.length === 0 ? (
            <Text style={styles.sinTickets}>No hay tickets en este estado.</Text>
          ) : (
            tickets.map((t) => {
              const vencido =
                esFechaPasada(t.fechaVencimiento) && t.estado !== 'SUBSANADO_CONFORME' && t.estado !== 'CERRADO';
              return (
                <Card key={t.id} style={[styles.ticketBox, vencido && styles.ticketBoxVencido]}>
                  <View style={styles.ticketFila}>
                    <Text style={styles.ticketTexto} numberOfLines={1}>
                      {t.contrato}
                    </Text>
                    {vencido ? (
                      <EstadoBadge estado="VENCIDO" tamano="sm" />
                    ) : (
                      <EstadoBadge estado={t.estado} tamano="sm" />
                    )}
                  </View>
                  <Text style={styles.ticketSubtexto} numberOfLines={2}>
                    {t.descripcion}
                  </Text>
                  <Text style={styles.ticketSubtexto}>
                    Creado: {t.fechaCreacion} · Vence: {t.fechaVencimiento}
                  </Text>
                </Card>
              );
            })
          )}
        </View>
      )}
    </View>
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
  stat: {
    flex: 1,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  statTexto: { fontSize: 10.5, textAlign: 'center', fontWeight: '600' },
  statNumero: { fontSize: 22, fontWeight: '800' },
  barra: {
    backgroundColor: COLORS.superficie,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    borderRadius: RADIOS.md,
    height: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barraIzquierda: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barraMarca: { width: 4, height: 18, borderRadius: 2 },
  barraTexto: { color: COLORS.textoPrimario, fontSize: 13, fontWeight: '700' },
  barraDerecha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barraNumero: { color: COLORS.textoSecundario, fontSize: 13, fontWeight: '700' },
  barraChevron: { color: COLORS.azul, fontSize: 12 },
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
  desplegable: { marginTop: 8, marginBottom: 10, paddingHorizontal: 2, gap: 8 },
  sinTickets: { color: COLORS.textoSecundario, fontSize: 12, fontStyle: 'italic' },
  ticketBox: {},
  ticketBoxVencido: {
    backgroundColor: COLOR_ESTADO.VENCIDO.suave,
    borderColor: COLOR_ESTADO.VENCIDO.color,
  },
  ticketFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ticketTexto: { fontSize: 13, color: COLORS.textoPrimario, fontWeight: '700', flex: 1 },
  ticketSubtexto: { fontSize: 11, color: COLORS.textoSecundario, marginTop: 4 },
});
