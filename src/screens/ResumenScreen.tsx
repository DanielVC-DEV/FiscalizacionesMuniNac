import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

// Todavía no existe una lista real de tickets (eso se arma cuando
// conectemos la creación de tickets a un guardado de verdad). Por ahora
// esta lista parte vacía a propósito, así que todos los contadores de
// abajo salen honestamente en 0.
const TICKETS: any[] = [];

const OPCIONES_PERIODO = ['Este mes', 'Este trimestre', 'Todo'];

type Estado = 'ABIERTO' | 'RESPONDIDO' | 'SUBSANADO_CONFORME' | 'CERRADO';

export default function ResumenScreen({ navigation }: any) {
  const [periodo, setPeriodo] = useState(OPCIONES_PERIODO[0]);
  const [busqueda, setBusqueda] = useState('');

  function siguientePeriodo() {
    const i = OPCIONES_PERIODO.indexOf(periodo);
    setPeriodo(OPCIONES_PERIODO[(i + 1) % OPCIONES_PERIODO.length]);
  }

  // Como TICKETS todavía está vacío, esto siempre da 0. Cuando existan
  // tickets de verdad, este mismo cálculo los va a contar solos.
  const porEstado = (estado: Estado) => TICKETS.filter((t) => t.estado === estado);
  const pendientesRevision = porEstado('RESPONDIDO').length;
  const vencidos = TICKETS.filter((t) => t.vencido).length;
  const requierenNuevaSubsanacion = TICKETS.filter((t) => t.estado === 'REQUIERE_NUEVA_SUBSANACION').length;

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
          placeholder="Buscar ticket ID"
          placeholderTextColor="#8b93a0"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <FilaEstado etiqueta="Abiertos" tickets={porEstado('ABIERTO')} />
        <FilaEstado etiqueta="Respondidos" tickets={porEstado('RESPONDIDO')} />
        <FilaEstado etiqueta="Subsanados" tickets={porEstado('SUBSANADO_CONFORME')} />
        <FilaEstado etiqueta="Cerrados" tickets={porEstado('CERRADO')} />
        <FilaEstado etiqueta="Total" tickets={TICKETS} />
      </View>
    </SafeAreaView>
  );
}

// Cada fila es un acordeón: muestra el nombre del estado y el total, y al
// tocarla se despliega la lista de tickets de ese estado (por ahora
// siempre vacía).
function FilaEstado({ etiqueta, tickets }: { etiqueta: string; tickets: any[] }) {
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
            tickets.map((t, i) => (
              <View key={i} style={styles.ticketBox}>
                <Text style={styles.ticketTexto}>{t.codigo ?? `Ticket #${i + 1}`}</Text>
              </View>
            ))
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
  ticketTexto: { fontSize: 13, color: '#1c2126' },
});
