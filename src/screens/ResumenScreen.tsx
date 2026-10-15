import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { useTickets } from '../data/store';
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

  // "Vencido" depende de la fecha de hoy, no solo de si cambió algún
  // ticket. Si dejas esta pantalla abierta de un día para otro, o sales y
  // vuelves a entrar, esto fuerza a recalcular con la fecha actual para
  // que un ticket que recién venció se vea reflejado altiro.
  const [, refrescar] = useState(0);
  useFocusEffect(
    useCallback(() => {
      refrescar((n) => n + 1);
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
      <View style={styles.linea} />

      <View style={styles.contenido}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.barraTitulo}>
          <Text style={styles.barraTitulotexto}>Resumen de tickets</Text>
        </View>

        <View style={styles.filaAtencion}>
          <View style={[styles.barra, { flex: 1 }]}>
            <Text style={styles.barraTexto}>Requiere atención</Text>
          </View>
          <TouchableOpacity style={styles.periodo} onPress={siguientePeriodo}>
            <Text style={styles.periodoTexto}>Periodo: {periodo} ▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filaStats}>
          <View style={styles.stat}>
            <Text style={styles.statTexto}>Pendientes{'\n'}de revisión</Text>
            <Text style={styles.statNumero}>{pendientesRevision}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statTexto}>Vencidos</Text>
            <Text style={styles.statNumero}>{vencidos}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statTexto}>Requieren nueva{'\n'}subsanación</Text>
            <Text style={styles.statNumero}>{requierenNuevaSubsanacion}</Text>
          </View>
        </View>

        <View style={styles.barra}>
          <Text style={styles.barraTexto}>Estado general</Text>
        </View>

        <TextInput
          style={styles.buscador}
          placeholder="Buscar por contrato o descripción"
          placeholderTextColor="#8b93a0"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <FilaEstado etiqueta="Abiertos" tickets={porEstado('ABIERTO')} />
        <FilaEstado etiqueta="Respondidos" tickets={porEstado('RESPONDIDO')} />
        <FilaEstado etiqueta="Subsanados" tickets={porEstado('SUBSANADO_CONFORME')} />
        <FilaEstado etiqueta="Cerrados" tickets={porEstado('CERRADO')} />
        <FilaEstado etiqueta="Total" tickets={filtrados} />
      </View>
    </SafeAreaView>
  );
}

// Cada fila es un acordeón: muestra el nombre del estado y el total, y al
// tocarla se despliega la lista de tickets de ese estado.
function FilaEstado({ etiqueta, tickets }: { etiqueta: string; tickets: Ticket[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity style={styles.barra} onPress={() => setAbierto((v) => !v)}>
        <Text style={styles.barraTexto}>
          {etiqueta}: {tickets.length} {abierto ? '▴' : '▾'}
        </Text>
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
                <View key={t.id} style={[styles.ticketBox, vencido && styles.ticketBoxVencido]}>
                  <View style={styles.ticketFila}>
                    <Text style={styles.ticketTexto} numberOfLines={1}>
                      {t.contrato}
                    </Text>
                    {vencido && (
                      <View style={styles.tagVencido}>
                        <Text style={styles.tagVencidoTexto}>VENCIDO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.ticketSubtexto} numberOfLines={2}>
                    {t.descripcion}
                  </Text>
                  <Text style={styles.ticketSubtexto}>
                    Creado: {t.fechaCreacion} · Vence: {t.fechaVencimiento}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#d9d9d9' },
  linea: { height: 1, backgroundColor: '#111', marginHorizontal: 4 },
  contenido: { padding: 16, paddingBottom: 24 },
  back: { fontSize: 13, color: '#1c2126', marginBottom: 10 },
  barraTitulo: {
    backgroundColor: '#686462',
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  barraTitulotexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  filaAtencion: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  periodo: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d7dbe0',
    borderRadius: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodoTexto: { fontSize: 11.5, color: '#1c2126' },
  filaStats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stat: {
    flex: 1,
    backgroundColor: '#686462',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  statTexto: { color: '#fff', fontSize: 10.5, textAlign: 'center' },
  statNumero: { color: '#fff', fontSize: 20, fontWeight: '700' },
  barra: {
    backgroundColor: '#686462',
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  barraTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  buscador: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d7dbe0',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1c2126',
    marginBottom: 16,
  },
  desplegable: { marginTop: -4, marginBottom: 10, paddingHorizontal: 4 },
  sinTickets: { color: '#5b6570', fontSize: 12, fontStyle: 'italic' },
  ticketBox: {
    backgroundColor: '#eceef0',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
  },
  ticketBoxVencido: {
    backgroundColor: '#fbe9e7',
    borderWidth: 1,
    borderColor: '#7c0101',
  },
  ticketFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ticketTexto: { fontSize: 13, color: '#1c2126', fontWeight: '600', flex: 1 },
  ticketSubtexto: { fontSize: 11, color: '#5b6570', marginTop: 2 },
  tagVencido: {
    backgroundColor: '#7c0101',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagVencidoTexto: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
});
